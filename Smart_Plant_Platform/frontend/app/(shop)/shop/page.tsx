'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import store, { Category, Product } from '@/utils/store'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'

export default function ShopPage() {
	const [categories, setCategories] = useState<Category[]>([])
	const [products, setProducts] = useState<Product[]>([])
	const [selectedCategory, setSelectedCategory] = useState<string>('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [categoriesData, productsData] = await Promise.all([
					store.getCategories(),
					store.getProducts(),
				])
				setCategories(categoriesData.data)
				setProducts(productsData.data)
			} catch (error: unknown) {
				if (error instanceof AxiosError) {
					toast.error(error.response?.data?.error || 'Failed to load products')
				} else {
					toast.error('Failed to load products')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	const handleCategoryChange = async (category: string) => {
		setSelectedCategory(category)
		try {
			const response = await store.getProducts(
				category === 'all' ? undefined : category
			)
			setProducts(response.data)
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to load products')
			} else {
				toast.error('Failed to load products')
			}
		}
	}

	const handleAddToCart = async (productId: number) => {
		try {
			await store.addToCart(productId)
			toast.success('Added to cart')
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to add to cart')
			} else {
				toast.error('Failed to add to cart')
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

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-8">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">Shop</h1>
					<Select value={selectedCategory} onValueChange={handleCategoryChange}>
						<SelectTrigger className="w-[200px]">
							<SelectValue placeholder="Select category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{categories.map((category) => (
								<SelectItem key={category.id} value={category.slug}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{products.length === 0 ? (
					<Card>
						<CardContent className="py-8">
							<div className="text-center">
								<h2 className="text-2xl font-semibold mb-4">
									No products found
								</h2>
								<p className="text-gray-600 mb-4">
									{selectedCategory === 'all'
										? 'There are no products available at the moment.'
										: 'No products found in this category.'}
								</p>
								<Button
									variant="outline"
									onClick={() => handleCategoryChange('all')}
								>
									View All Products
								</Button>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{products.map((product) => (
							<Card key={product.id} className="flex flex-col">
								<CardHeader>
									<div className="relative h-48 w-full mb-4">
										<Image
											src={product.image || '/placeholder.png'}
											alt={product.name}
											fill
											className="object-cover rounded-md"
										/>
									</div>
									<CardTitle>{product.name}</CardTitle>
								</CardHeader>
								<CardContent className="flex-grow">
									<p className="text-gray-600 mb-2">{product.description}</p>
									<p className="text-lg font-semibold text-green-600">
										${Number(product.price).toFixed(2)}
									</p>
									<p
										className={`text-sm ${
											product.stock === 0
												? 'text-red-500'
												: product.stock < 5
												? 'text-orange-500'
												: 'text-gray-500'
										}`}
									>
										{product.stock === 0
											? 'Out of Stock'
											: product.stock < 5
											? `Only ${product.stock} left in stock`
											: `${product.stock} in stock`}
									</p>
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										onClick={() => handleAddToCart(product.id)}
										disabled={product.stock === 0}
									>
										{product.stock === 0
											? 'Out of Stock'
											: product.stock < 5
											? 'Add to Cart (Limited Stock)'
											: 'Add to Cart'}
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	)
}
