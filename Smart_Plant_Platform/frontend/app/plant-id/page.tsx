'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Image as ImageIcon, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const PLANT_ID_API_KEY = process.env.NEXT_PUBLIC_PLANT_ID_API_KEY || ''

if (!PLANT_ID_API_KEY) {
	throw new Error('PLANT_ID_API_KEY is not set')
}

interface PlantDetails {
	id: string
	name: string
	scientific_name: string
	common_names: string[]
	description: {
		value: string
		citation: string
		license_name: string
		license_url: string
	}
	url: string
	image: {
		value: string
		citation: string
		license_name: string
		license_url: string
	}
	taxonomy: {
		name_authority: string
		rank: string
		gbif_id: number
		inaturalist_id: number
	}
	synonyms: string[]
	edible_parts: string[]
	watering: {
		min: number
		max: number
	}
	propagation_methods: string[]
}

interface PlantSearchResponse {
	entities: Array<{
		matched_in: string
		matched_in_type: string
		access_token: string
		match_position: number
		match_length: number
		entity_name: string
	}>
	entities_trimmed: boolean
	limit: number
}

export default function PlantIdPage() {
	const [searchQuery, setSearchQuery] = useState('')
	const [plantDetails, setPlantDetails] = useState<PlantDetails[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!searchQuery.trim()) return

		setLoading(true)
		setError('')
		try {
			const response = await fetch(
				`https://plant.id/api/v3/kb/plants/name_search?q=${encodeURIComponent(
					searchQuery
				)}&language=en`,
				{
					headers: {
						'Api-Key': PLANT_ID_API_KEY,
					},
				}
			)

			const data: PlantSearchResponse = await response.json()
			if (data.entities) {
				// For each entity, fetch detailed plant information
				const plantDetailsPromises = data.entities.map(async (entity) => {
					const plantResponse = await fetch(
						`https://plant.id/api/v3/kb/plants/${entity.access_token}?details=common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods&language=en`,
						{
							headers: {
								'Api-Key': PLANT_ID_API_KEY,
							},
						}
					)
					return plantResponse.json()
				})

				const plantDetails = await Promise.all(plantDetailsPromises)
				setPlantDetails(plantDetails)
			}
		} catch {
			setError('Failed to search for plants. Please try again.')
		} finally {
			setLoading(false)
		}
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
					Plant Search
				</motion.h1>
				<div className="w-32 h-1 mx-auto mb-8 bg-gradient-to-r from-green-300 to-emerald-600 rounded-full" />
				<motion.p
					className="text-base text-gray-600 text-center mb-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
				>
					Search for any plant species by name. Our comprehensive database
					provides detailed information about each plant.
				</motion.p>

				<div className="flex flex-col items-center gap-6">
					<motion.form
						onSubmit={handleSearch}
						className="w-full max-w-md"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.5 }}
					>
						<Input
							type="text"
							placeholder="Search for a plant..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full mb-2"
						/>
						<Button type="submit" className="w-full">
							<Search className="mr-2 h-4 w-4" />
							Search
						</Button>
					</motion.form>

					<motion.div
						className="w-full max-w-md"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.5 }}
					>
						<Link href="/plant-id/image">
							<Button variant="outline" className="w-full">
								<ImageIcon className="mr-2 h-4 w-4" />
								Identify by Image
							</Button>
						</Link>
					</motion.div>
				</div>

				{loading && (
					<div className="text-center mt-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
						<p className="mt-2 text-gray-600">Searching...</p>
					</div>
				)}

				{error && <div className="text-center mt-8 text-red-600">{error}</div>}

				{plantDetails.length > 0 && (
					<motion.div
						className="mt-8 grid gap-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						{plantDetails.map((plant, index) => (
							<motion.div
								key={`${plant.id || 'unknown'}-${
									plant.scientific_name || 'unknown'
								}-${index}`}
								className="bg-white p-6 rounded-lg shadow-md"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
							>
								<div className="flex gap-4">
									{plant.image?.value && (
										<div className="flex flex-col gap-2">
											<img
												src={plant.image.value}
												alt={plant.name}
												className="w-32 h-32 object-cover rounded-lg"
											/>
											{plant.image.citation && (
												<p className="text-xs text-gray-500 max-w-32 break-words">
													Image:{' '}
													<a
														href={plant.image.citation}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-500 hover:underline"
													>
														{plant.image.citation}
													</a>
												</p>
											)}
										</div>
									)}
									<div className="flex-1">
										<h3 className="text-xl font-semibold text-green-700">
											{plant.name}
										</h3>
										<p className="text-sm text-gray-500 italic">
											{plant.scientific_name}
										</p>
										{plant.common_names && plant.common_names.length > 0 && (
											<p className="text-sm text-gray-600 mt-1">
												Also known as: {plant.common_names.join(', ')}
											</p>
										)}
										<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="font-medium">Family:</span>{' '}
												{plant.taxonomy?.rank}
											</div>
											{plant.taxonomy?.gbif_id && (
												<div>
													<span className="font-medium">GBIF ID:</span>{' '}
													{plant.taxonomy.gbif_id}
												</div>
											)}
											{plant.taxonomy?.inaturalist_id && (
												<div>
													<span className="font-medium">iNaturalist ID:</span>{' '}
													{plant.taxonomy.inaturalist_id}
												</div>
											)}
										</div>
										{plant.description && (
											<div className="text-gray-600 mt-4">
												<p>{plant.description.value}</p>
												{plant.description.citation && (
													<p className="text-xs text-gray-500 mt-2">
														Source: {plant.description.citation}
													</p>
												)}
												{plant.description.license_name && (
													<p className="text-xs text-gray-500">
														License: {plant.description.license_name}
													</p>
												)}
											</div>
										)}
										{plant.edible_parts && plant.edible_parts.length > 0 && (
											<div className="mt-4">
												<span className="font-medium">Edible Parts:</span>{' '}
												{plant.edible_parts.join(', ')}
											</div>
										)}
										{plant.propagation_methods &&
											plant.propagation_methods.length > 0 && (
												<div className="mt-4">
													<span className="font-medium">
														Propagation Methods:
													</span>{' '}
													{plant.propagation_methods.join(', ')}
												</div>
											)}
										{plant.watering && (
											<div className="mt-4">
												<span className="font-medium">Watering Range:</span>{' '}
												{plant.watering.min} - {plant.watering.max}
											</div>
										)}
										{plant.url && (
											<a
												href={plant.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-green-600 hover:text-green-800 mt-4 inline-flex items-center"
											>
												<Info className="mr-2 h-4 w-4" />
												Learn more
											</a>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>
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
