from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
import os
from .models import ChatMessage, Conversation
from .serializers import ChatMessageSerializer, ConversationSerializer

SYSTEM_PROMPT = """You are a plant care expert AI assistant. Your responses should be:
1. Clear and well-structured using markdown formatting
2. Use bullet points or numbered lists for steps
3. Use headings (##) for different sections
4. Use **bold** for important terms
5. Include relevant emojis where appropriate (🌱, 🪴, 💧, ☀️, etc.)
6. Keep responses concise but informative

Remember to focus on plant care, gardening, and botanical topics."""


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).order_by(
            "-updated_at"
        )

    def create(self, request):
        title = request.data.get("title", "New Conversation")
        conversation = Conversation.objects.create(user=request.user, title=title)
        serializer = self.serializer_class(conversation)
        return Response(serializer.data)


class ChatViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatMessageSerializer

    def get_queryset(self, conversation_id):
        return ChatMessage.objects.filter(
            conversation_id=conversation_id, conversation__user=self.request.user
        ).order_by("timestamp")

    def list(self, request, conversation_id=None):
        messages = self.get_queryset(conversation_id)
        serializer = self.serializer_class(messages, many=True)
        return Response(serializer.data)

    def create(self, request, conversation_id=None):
        message = request.data.get("message")
        if not message:
            return Response(
                {"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            conversation = Conversation.objects.get(
                id=conversation_id, user=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Save user message
        user_message = ChatMessage.objects.create(
            conversation=conversation, content=message, is_bot=False
        )

        # Get chat history for context
        chat_history = self.get_queryset(conversation_id).order_by("timestamp")
        history_messages = []
        for msg in chat_history:
            if msg.is_bot:
                history_messages.append(AIMessage(content=msg.content))
            else:
                history_messages.append(HumanMessage(content=msg.content))

        # Initialize LangChain components with updated patterns
        llm = ChatOpenAI(
            model="nvidia/llama-3.1-nemotron-70b-instruct:free",
            openai_api_base="https://openrouter.ai/api/v1",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.7,
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SYSTEM_PROMPT),
                *[(msg.type.lower(), msg.content) for msg in history_messages],
                ("human", "{input}"),
            ]
        )

        chain = prompt | llm | StrOutputParser()

        try:
            # Get response from LangChain
            response = chain.invoke({"input": message})

            # Save bot response
            bot_message = ChatMessage.objects.create(
                conversation=conversation,
                content=response,
                is_bot=True,
                metadata={
                    "model": "nvidia/llama-3.1-nemotron-70b-instruct:free",
                    "temperature": 0.7,
                },
            )

            # Update conversation timestamp
            conversation.save()

            return Response(
                {
                    "user_message": ChatMessageSerializer(user_message).data,
                    "bot_message": ChatMessageSerializer(bot_message).data,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Failed to get response: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
