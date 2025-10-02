'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { PlaceholderImage } from '@/components/ui/placeholder-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Edit } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import store, { UserPlant } from '@/utils/store'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import Image from 'next/image'

export default function PlantDetailPage() {
	const params = useParams()
	const [plant, setPlant] = useState<UserPlant | null>(null)
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [editName, setEditName] = useState('')
	const [editDescription, setEditDescription] = useState('')
	const [editImage, setEditImage] = useState<File | null>(null)
	const [note, setNote] = useState('')
	const [careTask, setCareTask] = useState('')
	const [careFrequency, setCareFrequency] = useState('weekly')
	const [careInstructions, setCareInstructions] = useState('')
	const [height, setHeight] = useState('')
	const [width, setWidth] = useState('')
	const [numLeaves, setNumLeaves] = useState('')
	const [growthNotes, setGrowthNotes] = useState('')
	const [growthImage, setGrowthImage] = useState<File | null>(null)

	useEffect(() => {
		fetchPlant()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.id])

	const fetchPlant = async () => {
		try {
			const response = await store.getUserPlant(Number(params.id))
			setPlant(response.data)
			setEditName(response.data.name)
			setEditDescription(response.data.description)
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to load plant')
			} else {
				toast.error('Failed to load plant')
			}
		} finally {
			setLoading(false)
		}
	}

	const handleUpdatePlant = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!plant) return

		try {
			const formData = new FormData()
			formData.append('name', editName)
			formData.append('description', editDescription)
			if (editImage) {
				formData.append('image', editImage)
			}

			await store.updateUserPlant(plant.id, formData)
			toast.success('Plant updated successfully')
			setIsEditing(false)
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to update plant')
			} else {
				toast.error('Failed to update plant')
			}
		}
	}

	const handleAddNote = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!plant || !note.trim()) return

		try {
			await store.addPlantNote(plant.id, note)
			toast.success('Note added successfully')
			setNote('')
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to add note')
			} else {
				toast.error('Failed to add note')
			}
		}
	}

	const handleDeleteNote = async (noteId: number) => {
		if (!plant) return

		try {
			await store.deletePlantNote(plant.id, noteId)
			toast.success('Note deleted successfully')
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to delete note')
			} else {
				toast.error('Failed to delete note')
			}
		}
	}

	const handleAddCareRoutine = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!plant || !careTask.trim() || !careInstructions.trim()) return

		try {
			await store.addCareRoutine(plant.id, {
				task: careTask,
				frequency: careFrequency,
				instructions: careInstructions,
			})
			toast.success('Care routine added successfully')
			setCareTask('')
			setCareInstructions('')
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to add care routine')
			} else {
				toast.error('Failed to add care routine')
			}
		}
	}

	const handleDeleteCareRoutine = async (routineId: number) => {
		if (!plant) return

		try {
			await store.deleteCareRoutine(plant.id, routineId)
			toast.success('Care routine deleted successfully')
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(
					error.response?.data?.error || 'Failed to delete care routine'
				)
			} else {
				toast.error('Failed to delete care routine')
			}
		}
	}

	const handleRecordGrowth = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!plant) return

		try {
			const formData = new FormData()
			if (height) formData.append('height', height)
			if (width) formData.append('width', width)
			if (numLeaves) formData.append('num_leaves', numLeaves)
			if (growthNotes) formData.append('notes', growthNotes)
			if (growthImage) formData.append('image', growthImage)

			await store.recordGrowth(plant.id, formData)
			toast.success('Growth record added successfully')
			setHeight('')
			setWidth('')
			setNumLeaves('')
			setGrowthNotes('')
			setGrowthImage(null)
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(
					error.response?.data?.error || 'Failed to add growth record'
				)
			} else {
				toast.error('Failed to add growth record')
			}
		}
	}

	const handleDeleteGrowthRecord = async (recordId: number) => {
		if (!plant) return

		try {
			await store.deleteGrowthRecord(plant.id, recordId)
			toast.success('Growth record deleted successfully')
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(
					error.response?.data?.error || 'Failed to delete growth record'
				)
			} else {
				toast.error('Failed to delete growth record')
			}
		}
	}

	const handleCompleteCareTask = async (routineId: number) => {
		if (!plant) return

		try {
			await store.completeCareTask(plant.id, routineId)
			toast.success('Care task marked as complete')
			fetchPlant()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to complete task')
			} else {
				toast.error('Failed to complete task')
			}
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-grow flex items-center justify-center">
					<div className="text-xl">Loading...</div>
				</main>
			</div>
		)
	}

	if (!plant) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-grow flex items-center justify-center">
					<div className="text-xl">Plant not found</div>
				</main>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>Plant Details</CardTitle>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setIsEditing(!isEditing)}
								>
									<Edit className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								{isEditing ? (
									<form onSubmit={handleUpdatePlant} className="space-y-4">
										<div className="aspect-square relative mb-4">
											{plant.image ? (
												<Image
													src={plant.image}
													alt={plant.name}
													fill
													className="object-cover rounded-lg"
												/>
											) : (
												<PlaceholderImage />
											)}
										</div>
										<div>
											<Label htmlFor="editImage">Update Image</Label>
											<Input
												id="editImage"
												type="file"
												accept="image/*"
												onChange={(e) =>
													setEditImage(
														e.target.files ? e.target.files[0] : null
													)
												}
											/>
										</div>
										<div>
											<Label htmlFor="editName">Name</Label>
											<Input
												id="editName"
												value={editName}
												onChange={(e) => setEditName(e.target.value)}
												placeholder="Plant name"
											/>
										</div>
										<div>
											<Label htmlFor="editDescription">Description</Label>
											<Textarea
												id="editDescription"
												value={editDescription}
												onChange={(e) => setEditDescription(e.target.value)}
												placeholder="Plant description"
											/>
										</div>
										<div className="flex space-x-2">
											<Button type="submit" disabled={!editName.trim()}>
												Save Changes
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={() => setIsEditing(false)}
											>
												Cancel
											</Button>
										</div>
									</form>
								) : (
									<>
										<div className="aspect-square relative mb-4">
											{plant.image ? (
												<Image
													src={plant.image}
													alt={plant.name}
													fill
													className="object-cover rounded-lg"
												/>
											) : (
												<PlaceholderImage />
											)}
										</div>
										<h2 className="text-2xl font-bold">{plant.name}</h2>
										<p className="text-gray-600 mt-2">{plant.description}</p>
									</>
								)}
							</CardContent>
						</Card>

						<Card className="mt-8">
							<CardHeader>
								<CardTitle>Notes</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleAddNote} className="space-y-4">
									<div>
										<Label htmlFor="note">Add a note</Label>
										<Textarea
											id="note"
											value={note}
											onChange={(e) => setNote(e.target.value)}
											placeholder="Write your note here..."
										/>
									</div>
									<Button type="submit" disabled={!note.trim()}>
										Add Note
									</Button>
								</form>
								<div className="mt-6 space-y-4">
									{plant.notes.map((note) => (
										<div
											key={note.id}
											className="bg-gray-50 p-4 rounded-lg flex justify-between items-start"
										>
											<div>
												<p className="text-gray-600">{note.content}</p>
												<p className="text-sm text-gray-400 mt-2">
													{new Date(note.created_at).toLocaleDateString()}
												</p>
											</div>
											<ConfirmDialog
												title="Delete Note"
												description="Are you sure you want to delete this note? This action cannot be undone."
												onConfirm={() => handleDeleteNote(note.id)}
											/>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					<div>
						<Card>
							<CardHeader>
								<CardTitle>Care Routines</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleAddCareRoutine} className="space-y-4">
									<div>
										<Label htmlFor="task">Task</Label>
										<Input
											id="task"
											value={careTask}
											onChange={(e) => setCareTask(e.target.value)}
											placeholder="e.g., Watering"
										/>
									</div>
									<div>
										<Label htmlFor="frequency">Frequency</Label>
										<Select
											value={careFrequency}
											onValueChange={setCareFrequency}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="daily">Daily</SelectItem>
												<SelectItem value="weekly">Weekly</SelectItem>
												<SelectItem value="biweekly">Bi-weekly</SelectItem>
												<SelectItem value="monthly">Monthly</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="instructions">Instructions</Label>
										<Textarea
											id="instructions"
											value={careInstructions}
											onChange={(e) => setCareInstructions(e.target.value)}
											placeholder="Write care instructions..."
										/>
									</div>
									<Button
										type="submit"
										disabled={!careTask.trim() || !careInstructions.trim()}
									>
										Add Care Routine
									</Button>
								</form>
								<div className="mt-6 space-y-4">
									{plant.care_routines.map((routine) => (
										<div key={routine.id} className="bg-gray-50 p-4 rounded-lg">
											<div className="flex justify-between items-start">
												<div>
													<h3 className="font-semibold">{routine.task}</h3>
													<p className="text-sm text-gray-600 mt-1">
														{routine.frequency.charAt(0).toUpperCase() +
															routine.frequency.slice(1)}
													</p>
													<p className="text-sm text-gray-600 mt-2">
														{routine.instructions}
													</p>
													{routine.last_performed && (
														<p className="text-sm text-gray-400 mt-2">
															Last performed:{' '}
															{new Date(
																routine.last_performed
															).toLocaleDateString()}
														</p>
													)}
													{routine.next_due && (
														<p className="text-sm text-gray-400">
															Next due:{' '}
															{new Date(routine.next_due).toLocaleDateString()}
														</p>
													)}
												</div>
												<div className="flex space-x-2">
													<Button
														size="sm"
														onClick={() => handleCompleteCareTask(routine.id)}
													>
														Complete
													</Button>
													<ConfirmDialog
														title="Delete Care Routine"
														description="Are you sure you want to delete this care routine? This action cannot be undone."
														onConfirm={() =>
															handleDeleteCareRoutine(routine.id)
														}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="mt-8">
							<CardHeader>
								<CardTitle>Growth Records</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleRecordGrowth} className="space-y-4">
									<div>
										<Label htmlFor="height">Height (cm)</Label>
										<Input
											id="height"
											type="number"
											step="0.1"
											value={height}
											onChange={(e) => setHeight(e.target.value)}
											placeholder="Enter height in cm"
										/>
									</div>
									<div>
										<Label htmlFor="width">Width (cm)</Label>
										<Input
											id="width"
											type="number"
											step="0.1"
											value={width}
											onChange={(e) => setWidth(e.target.value)}
											placeholder="Enter width in cm"
										/>
									</div>
									<div>
										<Label htmlFor="numLeaves">Number of Leaves</Label>
										<Input
											id="numLeaves"
											type="number"
											value={numLeaves}
											onChange={(e) => setNumLeaves(e.target.value)}
											placeholder="Enter number of leaves"
										/>
									</div>
									<div>
										<Label htmlFor="growthNotes">Notes</Label>
										<Textarea
											id="growthNotes"
											value={growthNotes}
											onChange={(e) => setGrowthNotes(e.target.value)}
											placeholder="Add any notes about growth..."
										/>
									</div>
									<div>
										<Label htmlFor="growthImage">Image</Label>
										<Input
											id="growthImage"
											type="file"
											accept="image/*"
											onChange={(e) =>
												setGrowthImage(
													e.target.files ? e.target.files[0] : null
												)
											}
										/>
									</div>
									<Button
										type="submit"
										disabled={
											!height &&
											!width &&
											!numLeaves &&
											!growthNotes &&
											!growthImage
										}
									>
										Record Growth
									</Button>
								</form>
								<div className="mt-6 space-y-4">
									{plant.growth_records.map((record) => (
										<div key={record.id} className="bg-gray-50 p-4 rounded-lg">
											<div className="flex justify-between items-start">
												<div>
													<p className="text-sm text-gray-600">
														Recorded on:{' '}
														{new Date(record.recorded_at).toLocaleDateString()}
													</p>
													{record.height && (
														<p className="text-sm">
															Height: {record.height} cm
														</p>
													)}
													{record.width && (
														<p className="text-sm">Width: {record.width} cm</p>
													)}
													{record.num_leaves && (
														<p className="text-sm">
															Leaves: {record.num_leaves}
														</p>
													)}
													{record.notes && (
														<p className="text-sm mt-2">{record.notes}</p>
													)}
													{record.image && (
														<div className="mt-2 aspect-square w-32 relative">
															<Image
																src={record.image}
																alt="Growth record"
																fill
																className="object-cover rounded"
															/>
														</div>
													)}
												</div>
												<ConfirmDialog
													title="Delete Growth Record"
													description="Are you sure you want to delete this growth record? This action cannot be undone."
													onConfirm={() => handleDeleteGrowthRecord(record.id)}
												/>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
			<footer className="bg-green-600 text-white py-4 mt-16">
				<div className="container mx-auto text-center">
					<p>&copy; 2023 SproutBotanica. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}
