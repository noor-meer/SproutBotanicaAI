'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, AlertTriangle, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

const PLANT_ID_API_KEY = process.env.NEXT_PUBLIC_PLANT_ID_API_KEY || ''

if (!PLANT_ID_API_KEY) {
	throw new Error('PLANT_ID_API_KEY is not set')
}

interface SimilarImage {
	id: string
	url: string
	url_small: string
	license_name: string
	license_url: string
	citation: string
	similarity: number
}

interface PlantSuggestion {
	name: string
	probability: number
	similar_images: SimilarImage[]
	access_token: string
}

interface DiseaseSuggestion {
	name: string
	probability: number
	similar_images: SimilarImage[]
	access_token: string
}

interface PlantDetails {
	common_names: string[]
	url: string
	description: {
		value: string
		citation: string
		license_name: string
		license_url: string
	}
	taxonomy: {
		genus: string
		family: string
	}
	rank: string
	gbif_id: number
	inaturalist_id: number
	image: {
		value: string
		citation: string
		license_name: string
		license_url: string
	}
	synonyms: string[]
	edible_parts: string[]
	watering: {
		min: number
		max: number
	}
	propagation_methods: string[]
}

interface SuggestionWithDetails {
	name: string
	details?: PlantDetails
}

interface DetailsResponse {
	result: {
		classification: {
			suggestions: SuggestionWithDetails[]
		}
		disease: {
			suggestions: SuggestionWithDetails[]
		}
	}
}

interface IdentificationResponse {
	access_token: string
	result: {
		classification: {
			suggestions: PlantSuggestion[]
		}
		disease: {
			suggestions: DiseaseSuggestion[]
		}
		is_healthy: {
			binary: boolean
			probability: number
		}
		is_plant: {
			binary: boolean
			probability: number
		}
	}
	status: string
}

interface DetailsModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	content: {
		name: string
		probability: number
		similar_images: SimilarImage[]
		access_token: string
		details?: PlantDetails
	}
}

function DetailsModal({ isOpen, onClose, title, content }: DetailsModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<motion.div
				className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
			>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">{title}</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="hover:bg-gray-100"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="space-y-4">
					<div>
						<h3 className="text-lg font-medium">{content.name}</h3>
						<p className="text-sm text-gray-600">
							Confidence: {formatProbability(content.probability)}
						</p>
					</div>

					{content.details && (
						<div className="space-y-4">
							{content.details.description && (
								<div>
									<h4 className="font-medium mb-2">Description</h4>
									<p className="text-gray-600">
										{content.details.description.value}
									</p>
									{content.details.description.citation && (
										<p className="text-xs text-gray-500 mt-2">
											Source: {content.details.description.citation}
										</p>
									)}
									{content.details.description.license_name && (
										<p className="text-xs text-gray-500">
											License: {content.details.description.license_name}
										</p>
									)}
								</div>
							)}

							{content.details.common_names &&
								content.details.common_names.length > 0 && (
									<div>
										<h4 className="font-medium mb-2">Common Names</h4>
										<p className="text-gray-600">
											{content.details.common_names.join(', ')}
										</p>
									</div>
								)}

							{content.details.taxonomy && (
								<div>
									<h4 className="font-medium mb-2">Taxonomy</h4>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div>
											<span className="font-medium">Rank:</span>{' '}
											{content.details.rank}
										</div>
										<div>
											<span className="font-medium">Genus:</span>{' '}
											{content.details.taxonomy.genus}
										</div>
										<div>
											<span className="font-medium">Family:</span>{' '}
											{content.details.taxonomy.family}
										</div>
									</div>
								</div>
							)}

							{content.details.edible_parts &&
								content.details.edible_parts.length > 0 && (
									<div>
										<h4 className="font-medium mb-2">Edible Parts</h4>
										<p className="text-gray-600">
											{content.details.edible_parts.join(', ')}
										</p>
									</div>
								)}

							{content.details.watering && (
								<div>
									<h4 className="font-medium mb-2">Watering</h4>
									<p className="text-gray-600">
										{content.details.watering.min} -{' '}
										{content.details.watering.max} times per week
									</p>
								</div>
							)}

							{content.details.propagation_methods &&
								content.details.propagation_methods.length > 0 && (
									<div>
										<h4 className="font-medium mb-2">Propagation Methods</h4>
										<p className="text-gray-600">
											{content.details.propagation_methods.join(', ')}
										</p>
									</div>
								)}

							{content.details.url && (
								<div>
									<a
										href={content.details.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-green-600 hover:text-green-800"
									>
										Learn more about this plant
									</a>
								</div>
							)}
						</div>
					)}

					<div>
						<h4 className="font-medium mb-2">Similar Images</h4>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{content.similar_images.map((image) => (
								<div key={image.id} className="space-y-2">
									<img
										src={image.url}
										alt={`Similar to ${content.name}`}
										className="w-full h-32 object-cover rounded-lg"
									/>
									<div className="text-xs text-gray-500">
										<p>Similarity: {formatProbability(image.similarity)}</p>
										<p className="truncate">Source: {image.citation}</p>
										{image.license_url && (
											<a
												href={image.license_url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 hover:underline"
											>
												{image.license_name}
											</a>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	)
}

const formatProbability = (probability: number) => {
	return `${(probability * 100).toFixed(1)}%`
}

export default function PlantIdImagePage() {
	const [identificationResult, setIdentificationResult] =
		useState<IdentificationResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedImage, setSelectedImage] = useState<string | null>(null)
	const [selectedDetails, setSelectedDetails] = useState<{
		title: string
		content: {
			name: string
			probability: number
			similar_images: SimilarImage[]
			access_token: string
			details?: PlantDetails
		}
	} | null>(null)
	const [detailsData, setDetailsData] = useState<{
		plants: Record<string, PlantDetails>
		diseases: Record<string, PlantDetails>
	}>({ plants: {}, diseases: {} })

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setSelectedImage(URL.createObjectURL(file))
			await identifyPlant(file)
		}
	}

	const identifyPlant = async (imageFile: File) => {
		setLoading(true)
		setError('')
		const formData = new FormData()
		formData.append('images', imageFile)
		formData.append('classification_level', 'species')
		formData.append('similar_images', 'true')
		formData.append('health', 'all')

		try {
			const response = await fetch('https://plant.id/api/v3/identification', {
				method: 'POST',
				headers: {
					'Api-Key': PLANT_ID_API_KEY,
				},
				body: formData,
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Failed to identify plant')
			}

			const data: IdentificationResponse = await response.json()
			setIdentificationResult(data)

			// Fetch details using the main access token
			if (data.access_token) {
				await fetchDetails(data.access_token)
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Failed to identify plant. Please try again.'
			)
		} finally {
			setLoading(false)
		}
	}

	const fetchDetails = async (access_token: string) => {
		try {
			const response = await fetch(
				`https://plant.id/api/v3/identification/${access_token}?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods&language=en`,
				{
					headers: {
						'Api-Key': PLANT_ID_API_KEY,
					},
				}
			)

			if (!response.ok) {
				throw new Error('Failed to fetch plant details')
			}

			const data: DetailsResponse = await response.json()

			// Store all plant and disease details
			const plants: Record<string, PlantDetails> = {}
			const diseases: Record<string, PlantDetails> = {}

			data.result.classification.suggestions.forEach((suggestion) => {
				if (suggestion.details) {
					plants[suggestion.name] = suggestion.details
				}
			})

			data.result.disease.suggestions.forEach((suggestion) => {
				if (suggestion.details) {
					diseases[suggestion.name] = suggestion.details
				}
			})

			setDetailsData({ plants, diseases })
		} catch (err) {
			console.error('Error fetching details:', err)
		}
	}

	const handleDetailsClick = (
		suggestion: PlantSuggestion | DiseaseSuggestion,
		type: 'plant' | 'disease'
	) => {
		const details =
			type === 'plant'
				? detailsData.plants[suggestion.name]
				: detailsData.diseases[suggestion.name]

		setSelectedDetails({
			title: type === 'plant' ? 'Plant Details' : 'Disease Details',
			content: {
				name: suggestion.name,
				probability: suggestion.probability,
				similar_images: suggestion.similar_images,
				access_token: suggestion.access_token,
				details,
			},
		})
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-8">
				<motion.h1
					className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-300 to-emerald-600 bg-clip-text text-transparent"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Plant Identification by Image
				</motion.h1>
				<div className="w-32 h-1 mx-auto mb-8 bg-gradient-to-r from-green-300 to-emerald-600 rounded-full" />
				<motion.p
					className="text-base text-gray-600 text-center mb-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
				>
					Upload a photo of any plant species and our AI-powered system will
					identify it within seconds.
				</motion.p>

				<div className="flex flex-col items-center gap-6">
					<motion.div
						className="w-full max-w-md"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.5 }}
					>
						<label className="block mb-2 text-sm font-medium text-gray-700">
							Upload Plant Image
						</label>
						<div className="flex items-center gap-2">
							<Input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="w-full"
								id="plant-image-upload"
							/>
							<Button
								type="button"
								onClick={() =>
									document.getElementById('plant-image-upload')?.click()
								}
							>
								<Upload className="mr-2 h-4 w-4" />
								Upload
							</Button>
						</div>
					</motion.div>
				</div>

				{selectedImage && (
					<motion.div
						className="mt-8 flex justify-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<img
							src={selectedImage}
							alt="Uploaded plant"
							className="max-w-full max-h-64 rounded-lg shadow-md object-contain"
						/>
					</motion.div>
				)}

				{loading && (
					<div className="text-center mt-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
						<p className="mt-2 text-gray-600">Analyzing...</p>
					</div>
				)}

				{error && <div className="text-center mt-8 text-red-600">{error}</div>}

				{identificationResult && (
					<motion.div
						className="mt-8 space-y-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						{/* Plant Status */}
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-4">Plant Status</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-2">
									<Check className="h-5 w-5 text-green-500" />
									<span>
										Plant Detection:{' '}
										{formatProbability(
											identificationResult.result.is_plant.probability
										)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									{identificationResult.result.is_healthy.binary ? (
										<Check className="h-5 w-5 text-green-500" />
									) : (
										<AlertTriangle className="h-5 w-5 text-yellow-500" />
									)}
									<span>
										Plant Health:{' '}
										{formatProbability(
											identificationResult.result.is_healthy.probability
										)}
									</span>
								</div>
							</div>
						</div>

						{/* Plant Identification */}
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-4">
								Possible Plant Species
							</h2>
							<div className="grid gap-6">
								{identificationResult.result.classification.suggestions.map(
									(suggestion, index) => (
										<div
											key={`plant-${suggestion.access_token}-${index}`}
											className="border-b pb-4 last:border-b-0"
										>
											<div className="flex flex-col md:flex-row gap-4">
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-green-700">
														{suggestion.name}
													</h3>
													<p className="text-sm text-gray-600">
														Confidence:{' '}
														{formatProbability(suggestion.probability)}
													</p>
												</div>
												<div className="flex items-center gap-4">
													<div className="flex gap-2 overflow-x-auto">
														{suggestion.similar_images.map(
															(image, imgIndex) => (
																<div
																	key={`plant-image-${image.id}-${imgIndex}`}
																	className="flex-none"
																>
																	<img
																		src={image.url_small}
																		alt={`Similar to ${suggestion.name}`}
																		className="w-24 h-24 object-cover rounded-lg"
																	/>
																	<p className="text-xs text-gray-500 mt-1 max-w-24 truncate">
																		{image.citation}
																	</p>
																</div>
															)
														)}
													</div>
													<Button
														variant="outline"
														onClick={() =>
															handleDetailsClick(suggestion, 'plant')
														}
													>
														Details
													</Button>
												</div>
											</div>
										</div>
									)
								)}
							</div>
						</div>

						{/* Health Assessment */}
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-xl font-semibold mb-4">Health Assessment</h2>
							<div className="grid gap-6">
								{identificationResult.result.disease.suggestions.map(
									(suggestion, index) => (
										<div
											key={`disease-${suggestion.access_token}-${index}`}
											className="border-b pb-4 last:border-b-0"
										>
											<div className="flex flex-col md:flex-row gap-4">
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-yellow-700">
														{suggestion.name}
													</h3>
													<p className="text-sm text-gray-600">
														Probability:{' '}
														{formatProbability(suggestion.probability)}
													</p>
												</div>
												<div className="flex items-center gap-4">
													<div className="flex gap-2 overflow-x-auto">
														{suggestion.similar_images.map(
															(image, imgIndex) => (
																<div
																	key={`disease-image-${image.id}-${imgIndex}`}
																	className="flex-none"
																>
																	<img
																		src={image.url_small}
																		alt={`Similar condition to ${suggestion.name}`}
																		className="w-24 h-24 object-cover rounded-lg"
																	/>
																	<p className="text-xs text-gray-500 mt-1 max-w-24 truncate">
																		{image.citation}
																	</p>
																</div>
															)
														)}
													</div>
													<Button
														variant="outline"
														onClick={() =>
															handleDetailsClick(suggestion, 'disease')
														}
													>
														Details
													</Button>
												</div>
											</div>
										</div>
									)
								)}
							</div>
						</div>
					</motion.div>
				)}

				{selectedDetails && (
					<DetailsModal
						isOpen={!!selectedDetails}
						onClose={() => setSelectedDetails(null)}
						title={selectedDetails.title}
						content={selectedDetails.content}
					/>
				)}
			</main>
			<footer className="bg-green-600 text-white py-4 mt-16">
				<div className="container mx-auto text-center">
					<p>&copy; 2023 SproutBotanica. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}
