'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { PlantCard } from '@/components/plant-card'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import store, { UserPlant } from '@/utils/store'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'

export default function TrackPage() {
	const [plants, setPlants] = useState<UserPlant[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchPlants()
	}, [])

	const fetchPlants = async () => {
		try {
			const response = await store.getUserPlants()
			setPlants(response.data || [])
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to load plants')
			} else {
				toast.error('Failed to load plants')
			}
			setPlants([]) // Set empty array on error
		} finally {
			setLoading(false)
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

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<motion.h1
						className="text-4xl font-bold bg-gradient-to-r from-green-300 to-emerald-600 bg-clip-text text-transparent"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						Track Your Plants
					</motion.h1>
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<Link href="/track/add">
							<Button className="bg-green-600 hover:bg-green-700 text-white">
								<Plus className="mr-2 h-4 w-4" />
								Add new plant
							</Button>
						</Link>
					</motion.div>
				</div>
				<motion.div
					className="w-32 h-1 mb-8 bg-gradient-to-r from-green-300 to-emerald-600 rounded-full"
					initial={{ opacity: 0, scaleX: 0 }}
					animate={{ opacity: 1, scaleX: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				/>
				{plants.length === 0 ? (
					<motion.div
						className="text-center py-12"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<h2 className="text-2xl font-semibold mb-4">No plants yet</h2>
						<p className="text-gray-600 mb-8">
							Start tracking your plants by adding your first one!
						</p>
						<Link href="/track/add">
							<Button className="bg-green-600 hover:bg-green-700 text-white">
								<Plus className="mr-2 h-4 w-4" />
								Add your first plant
							</Button>
						</Link>
					</motion.div>
				) : (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						{plants.map((plant) => (
							<PlantCard
								key={plant.id}
								id={plant.id}
								name={plant.name}
								imageUrl={plant.image}
							/>
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
