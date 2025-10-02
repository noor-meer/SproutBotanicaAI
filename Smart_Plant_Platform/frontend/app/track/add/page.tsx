'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import store from '@/utils/store'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'

export default function AddPlantPage() {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [image, setImage] = useState<File | null>(null)
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const formData = new FormData()
			formData.append('name', name)
			formData.append('description', description)
			if (image) {
				formData.append('image', image)
			}

			await store.createUserPlant(formData)
			toast.success('Plant added successfully')
			router.push('/track')
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to add plant')
			} else {
				toast.error('Failed to add plant')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-8">
				<h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-300 to-emerald-600 bg-clip-text text-transparent">
					Add New Plant
				</h1>
				<Card className="max-w-2xl mx-auto">
					<CardHeader>
						<CardTitle>Plant Details</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="plant-image">Plant Image</Label>
								<div className="flex items-center justify-center w-full">
									<label
										htmlFor="plant-image"
										className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
									>
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<Upload className="w-8 h-8 mb-4 text-gray-500" />
											<p className="mb-2 text-sm text-gray-500">
												<span className="font-semibold">Click to upload</span>{' '}
												or drag and drop
											</p>
											<p className="text-xs text-gray-500">PNG, JPG or GIF</p>
										</div>
										<Input
											id="plant-image"
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) =>
												setImage(e.target.files ? e.target.files[0] : null)
											}
										/>
									</label>
								</div>
								{image && (
									<p className="text-sm text-gray-500">
										Selected file: {image.name}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="plant-name">Plant Name</Label>
								<Input
									id="plant-name"
									type="text"
									placeholder="Enter plant name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="plant-description">Description</Label>
								<Textarea
									id="plant-description"
									placeholder="Enter plant description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									required
								/>
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? 'Adding Plant...' : 'Add Plant'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</main>
			<footer className="bg-green-600 text-white py-4 mt-16">
				<div className="container mx-auto text-center">
					<p>&copy; 2023 SproutBotanica. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}
