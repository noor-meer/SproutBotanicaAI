'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2, MessageSquare, Edit2, Check, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import axios from '@/utils/axios'
import { toast } from 'react-toastify'

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

interface ConversationSidebarProps {
	conversations: Conversation[]
	activeConversationId: number | null
	onConversationSelect: (id: number) => void
	onConversationsUpdate: () => void
}

export function ConversationSidebar({
	conversations,
	activeConversationId,
	onConversationSelect,
	onConversationsUpdate,
}: ConversationSidebarProps) {
	const [isCreating, setIsCreating] = useState(false)
	const [newTitle, setNewTitle] = useState('')
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editTitle, setEditTitle] = useState('')

	const handleCreateConversation = async () => {
		if (!newTitle.trim()) return

		try {
			const response = await axios.post('/chat/conversations/', {
				title: newTitle,
			})
			onConversationsUpdate()
			onConversationSelect(response.data.id)
			setIsCreating(false)
			setNewTitle('')
		} catch (error) {
			console.error('Failed to create conversation:', error)
			toast.error('Failed to create conversation')
		}
	}

	const handleDeleteConversation = async (id: number) => {
		try {
			await axios.delete(`/chat/conversations/${id}/`)
			onConversationsUpdate()
			if (activeConversationId === id) {
				onConversationSelect(conversations[0]?.id || 0)
			}
		} catch (error) {
			console.error('Failed to delete conversation:', error)
			toast.error('Failed to delete conversation')
		}
	}

	const handleUpdateTitle = async (id: number) => {
		if (!editTitle.trim()) return

		try {
			await axios.patch(`/chat/conversations/${id}/`, {
				title: editTitle,
			})
			onConversationsUpdate()
			setEditingId(null)
			setEditTitle('')
		} catch (error) {
			console.error('Failed to update conversation title:', error)
			toast.error('Failed to update conversation title')
		}
	}

	return (
		<div className="w-64 border-r border-gray-200 flex flex-col h-full">
			<div className="p-4 border-b border-gray-200">
				<Button className="w-full" onClick={() => setIsCreating(true)}>
					<Plus className="w-4 h-4 mr-2" />
					New Chat
				</Button>
			</div>

			{isCreating && (
				<div className="p-4 border-b border-gray-200">
					<div className="flex gap-2">
						<Input
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							placeholder="Enter conversation title..."
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									handleCreateConversation()
								}
							}}
						/>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsCreating(false)}
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</div>
			)}

			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{conversations.map((conversation) => (
						<div
							key={conversation.id}
							className={cn(
								'flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100',
								activeConversationId === conversation.id && 'bg-gray-100'
							)}
							onClick={() => onConversationSelect(conversation.id)}
						>
							<MessageSquare className="w-4 h-4" />
							{editingId === conversation.id ? (
								<div className="flex-1 flex gap-2">
									<Input
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										onClick={(e) => e.stopPropagation()}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												handleUpdateTitle(conversation.id)
											}
										}}
									/>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation()
											handleUpdateTitle(conversation.id)
										}}
									>
										<Check className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation()
											setEditingId(null)
											setEditTitle('')
										}}
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
							) : (
								<>
									<div className="flex-1 truncate">{conversation.title}</div>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation()
												setEditingId(conversation.id)
												setEditTitle(conversation.title)
											}}
										>
											<Edit2 className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => {
												e.stopPropagation()
												handleDeleteConversation(conversation.id)
											}}
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	)
}
