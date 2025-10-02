'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import axios from '@/utils/axios'
import { toast } from 'react-toastify'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { Header } from '@/components/header'
import Footer from '@/components/footer'

interface Message {
	id: number
	content: string
	timestamp: string
	is_bot: boolean
}

interface Conversation {
	id: number
	title: string
	updated_at: string
	last_message: {
		content: string
		timestamp: string
	} | null
	message_count: number
}

export default function ChatPage() {
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [activeConversationId, setActiveConversationId] = useState<
		number | null
	>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [inputMessage, setInputMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isBotTyping, setIsBotTyping] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const loadConversations = async () => {
		try {
			const response = await axios.get('/chat/conversations/')
			setConversations(response.data)
			if (response.data.length > 0 && !activeConversationId) {
				setActiveConversationId(response.data[0].id)
			}
		} catch (error) {
			console.error('Failed to load conversations:', error)
			toast.error('Failed to load conversations')
		}
	}

	const loadMessages = async (conversationId: number) => {
		try {
			const response = await axios.get(
				`/chat/conversations/${conversationId}/messages/`
			)
			setMessages(response.data)
		} catch (error) {
			console.error('Failed to load messages:', error)
			toast.error('Failed to load messages')
		}
	}

	useEffect(() => {
		loadConversations()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (activeConversationId) {
			loadMessages(activeConversationId)
		}
	}, [activeConversationId])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!inputMessage.trim() || !activeConversationId) return

		const message = inputMessage.trim()
		setInputMessage('')
		setIsLoading(true)
		setIsBotTyping(true)

		// Add user message immediately
		const userMessage: Message = {
			id: Date.now(), // Temporary ID
			content: message,
			timestamp: new Date().toISOString(),
			is_bot: false,
		}
		setMessages((prev) => [...prev, userMessage])

		try {
			const response = await axios.post(
				`/chat/conversations/${activeConversationId}/messages/`,
				{
					message,
				}
			)

			setMessages((prev) => [
				...prev.filter((m) => m.id !== userMessage.id), // Remove temporary message
				response.data.user_message,
				response.data.bot_message,
			])
			loadConversations() // Refresh conversations to update last message
		} catch (error) {
			console.error('Failed to send message:', error)
			toast.error('Failed to send message')
			// Remove the temporary message on error
			setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
		} finally {
			setIsLoading(false)
			setIsBotTyping(false)
		}
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow flex h-[calc(100vh-8rem)]">
				<ConversationSidebar
					conversations={conversations}
					activeConversationId={activeConversationId}
					onConversationSelect={setActiveConversationId}
					onConversationsUpdate={loadConversations}
				/>

				<div className="flex-1 flex flex-col">
					{activeConversationId ? (
						<>
							<ScrollArea className="flex-1 p-4">
								<div className="space-y-4">
									{messages.map((message) => (
										<div
											key={message.id}
											className={`flex ${
												message.is_bot ? 'justify-start' : 'justify-end'
											}`}
										>
											<div
												className={`max-w-[80%] rounded-lg p-4 ${
													message.is_bot
														? 'bg-gray-100 text-gray-900'
														: 'bg-primary text-primary-foreground'
												}`}
											>
												<ReactMarkdown
													remarkPlugins={[remarkGfm]}
													components={{
														h1: ({ children }) => (
															<h1 className="text-xl font-bold mb-2">
																{children}
															</h1>
														),
														h2: ({ children }) => (
															<h2 className="text-lg font-semibold mb-2">
																{children}
															</h2>
														),
														p: ({ children }) => (
															<p className="mb-2">{children}</p>
														),
														ul: ({ children }) => (
															<ul className="list-disc list-inside mb-2">
																{children}
															</ul>
														),
														ol: ({ children }) => (
															<ol className="list-decimal list-inside mb-2">
																{children}
															</ol>
														),
														li: ({ children }) => (
															<li className="mb-1">{children}</li>
														),
														code: ({ children }) => (
															<code className="bg-gray-200 rounded px-1 py-0.5">
																{children}
															</code>
														),
														pre: ({ children }) => (
															<pre className="bg-gray-200 rounded p-2 mb-2 overflow-x-auto">
																{children}
															</pre>
														),
														blockquote: ({ children }) => (
															<blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
																{children}
															</blockquote>
														),
													}}
												>
													{message.content}
												</ReactMarkdown>
												<div className="text-xs mt-2 opacity-70">
													{new Date(message.timestamp).toLocaleString()}
												</div>
											</div>
										</div>
									))}
									<div ref={messagesEndRef} />
									{isBotTyping && (
										<div className="flex justify-start">
											<div className="max-w-[80%] rounded-lg p-4 bg-gray-100 text-gray-900">
												<div className="flex space-x-2">
													<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
													<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
													<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
												</div>
											</div>
										</div>
									)}
								</div>
							</ScrollArea>

							<form onSubmit={handleSubmit} className="p-4 border-t">
								<div className="flex gap-2">
									<Input
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										placeholder="Ask about plant care..."
										disabled={isLoading}
									/>
									<Button type="submit" disabled={isLoading}>
										<Send className="w-4 h-4" />
									</Button>
								</div>
							</form>
						</>
					) : (
						<div className="flex-1 flex items-center justify-center text-gray-500">
							Select a conversation or create a new one
						</div>
					)}
				</div>
			</main>
			<Footer />
		</div>
	)
}
