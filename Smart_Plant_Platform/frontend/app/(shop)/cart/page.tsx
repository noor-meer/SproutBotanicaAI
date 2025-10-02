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
import store, { Cart } from '@/utils/store'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

export default function CartPage() {
	const [cart, setCart] = useState<Cart | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		fetchCart()
	}, [])

	const fetchCart = async () => {
		try {
			const response = await store.getCart()
			setCart(response.data[0])
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to load cart')
			} else {
				toast.error('Failed to load cart')
			}
		} finally {
			setLoading(false)
		}
	}

	const handleUpdateQuantity = async (productId: number, quantity: number) => {
		try {
			await store.updateCartItemQuantity(productId, quantity)
			fetchCart()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to update quantity')
			} else {
				toast.error('Failed to update quantity')
			}
		}
	}

	const handleRemoveItem = async (productId: number) => {
		try {
			await store.removeFromCart(productId)
			fetchCart()
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to remove item')
			} else {
				toast.error('Failed to remove item')
			}
		}
	}

	const handleCheckout = () => {
		router.push('/checkout')
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

	if (!cart || !cart.items || cart.items.length === 0) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-grow container mx-auto px-4 py-8">
					<Card>
						<CardContent className="py-8">
							<div className="text-center">
								<h2 className="text-2xl font-semibold mb-4">
									Your cart is empty
								</h2>
								<Button onClick={() => router.push('/shop')}>
									Continue Shopping
								</Button>
							</div>
						</CardContent>
					</Card>
				</main>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						{cart.items.map((item) => (
							<Card key={item.id} className="mb-4">
								<CardContent className="p-4">
									<div className="flex items-center gap-4">
										<div className="relative h-24 w-24">
											<Image
												src={item.product_image || '/placeholder.png'}
												alt={item.product_name}
												fill
												className="object-cover rounded-md"
											/>
										</div>
										<div className="flex-grow">
											<h3 className="font-semibold">{item.product_name}</h3>
											<p className="text-green-600">
												${Number(item.product_price).toFixed(2)}
											</p>
											<div className="flex items-center gap-2 mt-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleUpdateQuantity(
															item.product,
															Math.max(1, item.quantity - 1)
														)
													}
												>
													-
												</Button>
												<span className="w-8 text-center">{item.quantity}</span>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleUpdateQuantity(
															item.product,
															item.quantity + 1
														)
													}
												>
													+
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="text-red-500 hover:text-red-700"
													onClick={() => handleRemoveItem(item.product)}
												>
													Remove
												</Button>
											</div>
										</div>
										<div className="text-right">
											<p className="font-semibold">
												${item.subtotal.toFixed(2)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<div className="lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>${cart.total_price.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span>Shipping</span>
										<span>Free</span>
									</div>
									<div className="border-t pt-2">
										<div className="flex justify-between font-semibold">
											<span>Total</span>
											<span>${cart.total_price.toFixed(2)}</span>
										</div>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button className="w-full" onClick={handleCheckout}>
									Proceed to Checkout
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
