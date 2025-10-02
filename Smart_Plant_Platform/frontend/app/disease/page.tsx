'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function DiseasesPage() {
	const [selectedImage, setSelectedImage] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [results, setResults] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setSelectedImage(file)
			setPreviewUrl(URL.createObjectURL(file))
			setResults(null)
			setError(null)
		}
	}

	const handleSubmit = async () => {
		if (!selectedImage) return

		setLoading(true)
		setError(null)

		const formData = new FormData()
		formData.append('image', selectedImage)

		try {
			const response = await fetch('http://localhost:8000/disease/classify/', {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) {
				throw new Error('Failed to classify image')
			}

			const data = await response.json()
			setResults(data)
		} catch (err) {
			setError('Failed to process image. Please try again.')
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold text-green-700 mb-6">
					Plant Disease Detection
				</h1>
				<p className="text-lg text-gray-600 mb-8">
					Detect and diagnose plant diseases early. Upload a photo of your
					plant, and our system will identify potential issues and suggest
					treatments.
				</p>

				<div className="grid md:grid-cols-2 gap-8">
					<Card>
						<CardHeader>
							<CardTitle className="text-xl font-semibold">
								Upload an Image
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
									{previewUrl ? (
										<div className="relative h-64 w-full">
											<Image
												src={previewUrl}
												alt="Preview"
												fill
												className="object-contain"
											/>
										</div>
									) : (
										<p className="text-gray-500">No image selected</p>
									)}
								</div>
								<input
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									className="hidden"
									id="image-upload"
								/>
								<label htmlFor="image-upload">
									<Button className="w-full" asChild>
										<div>
											<Upload className="mr-2 h-4 w-4" /> Select Image
										</div>
									</Button>
								</label>
								<Button
									className="w-full"
									onClick={handleSubmit}
									disabled={!selectedImage || loading}
								>
									{loading ? 'Processing...' : 'Analyze Image'}
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-xl font-semibold">Results</CardTitle>
						</CardHeader>
						<CardContent>
							{error && <div className="text-red-500 mb-4">{error}</div>}
							{results && (
								<div className="space-y-4">
									<div className="bg-green-50 p-4 rounded-lg">
										<h3 className="font-semibold text-green-800">
											Most Likely Diagnosis:
										</h3>
										<p className="text-lg text-green-700">
											{results.most_likely[0]}
										</p>
										<p className="text-sm text-green-600">
											Confidence: {(results.most_likely[1] * 100).toFixed(2)}%
										</p>
									</div>
									<div>
										<h3 className="font-semibold mb-2">
											All Possible Diagnoses:
										</h3>
										<div className="space-y-2">
											{Object.entries(results.predictions).map(
												([disease, probability]) => (
													<div
														key={disease}
														className="flex justify-between items-center"
													>
														<span className="text-gray-700">{disease}</span>
														<span className="text-gray-600">
															{(Number(probability) * 100).toFixed(2)}%
														</span>
													</div>
												)
											)}
										</div>
									</div>
								</div>
							)}
							{!results && !error && (
								<p className="text-gray-500 text-center">
									Upload an image to get started
								</p>
							)}
						</CardContent>
					</Card>
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
