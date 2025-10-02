'use client'

import { Header } from '@/components/header'
import { ImageSlider } from '@/components/image-slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Leaf,
	AlertTriangle,
	ShoppingBag,
	BarChart2,
	MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/footer'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
	const { isAuthenticated } = useAuth()

	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
			<Header />
			<main className="flex-grow flex flex-col">
				<ImageSlider />
				<section className="bg-white dark:bg-gray-800 py-16 px-4 text-center">
					<div className="container mx-auto">
						<h1 className="text-4xl font-bold text-green-700 dark:text-green-400 mb-4">
							SproutBotanica
						</h1>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
							Your personal plant care companion. Identify plants, detect
							diseases, track growth, and chat with our AI bot for expert
							advice.
						</p>
						<hr className="w-32 mx-auto border-t-2 border-green-500 mb-8" />
						<p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
							SproutBotanica combines cutting-edge technology with a passion for
							plants. Whether you&apos;re a seasoned gardener or just starting
							your green journey, our app provides the tools and knowledge you
							need to help your plants thrive.
						</p>
					</div>
				</section>
				<section className="bg-gray-100 dark:bg-gray-700 py-16 px-4">
					<div className="container mx-auto">
						<h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-12 text-center">
							Our Features
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[
								{
									icon: Leaf,
									title: 'Plant Identification',
									description:
										'Instantly identify any plant species by simply taking a photo. Our AI-powered system provides accurate results within seconds.',
									color: 'text-green-600 dark:text-green-400',
								},
								{
									icon: AlertTriangle,
									title: 'Disease Detection',
									description:
										'Detect plant diseases early. Upload a photo of your plant, and our system will diagnose potential issues and suggest treatments.',
									color: 'text-yellow-600 dark:text-yellow-400',
								},
								{
									icon: ShoppingBag,
									title: 'E-commerce',
									description:
										'Shop for plants, tools, and accessories directly through our app. We partner with trusted suppliers to bring you quality products.',
									color: 'text-blue-600 dark:text-blue-400',
								},
								{
									icon: BarChart2,
									title: 'Growth Tracking',
									description:
										"Monitor your plants' growth over time. Set care reminders, log watering and fertilizing, and watch your garden flourish.",
									color: 'text-purple-600 dark:text-purple-400',
								},
								{
									icon: MessageSquare,
									title: 'Chat with BOT',
									description:
										'Get instant answers to your plant care questions. Our AI chatbot provides expert advice 24/7, helping you become a better gardener.',
									color: 'text-indigo-600 dark:text-indigo-400',
								},
							].map((feature, index) => (
								<Card
									key={index}
									className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 dark:bg-gray-800 dark:border-gray-700"
								>
									<CardHeader className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
										<div className="flex justify-center mb-4">
											<div className="w-16 h-16 rounded-full border border-green-600 dark:border-green-400 flex items-center justify-center bg-gradient-to-br from-green-300 to-emerald-500 dark:from-green-700 dark:to-emerald-900 p-3">
												<feature.icon className={`w-8 h-8 text-white`} />
											</div>
										</div>
										<CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
											{feature.title}
										</CardTitle>
									</CardHeader>
									<CardContent className="p-6">
										<p className="text-gray-600 dark:text-gray-300">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>
				<div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 bg-[url('/placeholder.svg?height=200&width=200')] bg-opacity-10 dark:bg-opacity-30 border-2 border-green-600 dark:border-green-400 rounded-xl p-10 max-w-4xl mx-auto shadow-xl transform hover:scale-105 transition-all duration-300 mt-16">
					<div className="flex justify-center items-center bg-gradient-to-r from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 text-white py-3 px-6 rounded-lg mb-6 shadow-lg">
						<h3 className="text-xl font-bold">Start Your Green Journey</h3>
					</div>
					<p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center max-w-2xl mx-auto">
						Unlock all features and nurture your plants like never before! Join
						our community of plant enthusiasts today.
					</p>
					<div className="flex justify-center space-x-6">
						{isAuthenticated ? (
							<Link href="/track">
								<Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 text-base shadow-md hover:shadow-lg dark:bg-green-700 dark:hover:bg-green-600">
									View Your Plants
								</Button>
							</Link>
						) : (
							<Link href="/login">
								<Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-300 text-base shadow-md hover:shadow-lg dark:bg-green-700 dark:hover:bg-green-600">
									Get Started
								</Button>
							</Link>
						)}
					</div>
				</div>
			</main>
			<div className="mt-14">
				<Footer />
			</div>
		</div>
	)
}
