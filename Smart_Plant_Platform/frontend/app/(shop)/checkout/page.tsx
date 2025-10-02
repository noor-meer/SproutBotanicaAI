'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import store, { Cart } from '@/utils/store'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
	const [cart, setCart] = useState<Cart | null>(null)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [shippingAddress, setShippingAddress] = useState('')
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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!shippingAddress.trim()) {
			toast.error('Please enter your shipping address')
			return
		}

		setSubmitting(true)
		try {
			await store.createOrder(shippingAddress)
			toast.success('Order placed successfully!')
			router.push('/orders')
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to place order')
			} else {
				toast.error('Failed to place order')
			}
		} finally {
			setSubmitting(false)
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

	if (!cart || cart.items.length === 0) {
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
				<h1 className="text-3xl font-bold mb-8">Checkout</h1>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div>
						<Card>
							<CardHeader>
								<CardTitle>Shipping Information</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="address">Shipping Address</Label>
										<Textarea
											id="address"
											value={shippingAddress}
											onChange={(e) => setShippingAddress(e.target.value)}
											placeholder="Enter your complete shipping address"
											className="min-h-[100px]"
										/>
									</div>
									<Button
										type="submit"
										className="w-full"
										disabled={submitting}
									>
										{submitting ? 'Placing Order...' : 'Place Order'}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>

					<div>
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{cart.items.map((item) => (
										<div
											key={item.id}
											className="flex justify-between items-center"
										>
											<div>
												<p className="font-medium">{item.product_name}</p>
												<p className="text-sm text-gray-500">
													Quantity: {item.quantity}
												</p>
											</div>
											<p className="font-semibold">
												${item.subtotal.toFixed(2)}
											</p>
										</div>
									))}
									<div className="border-t pt-4">
										<div className="flex justify-between">
											<span>Subtotal</span>
											<span>${cart.total_price.toFixed(2)}</span>
										</div>
										<div className="flex justify-between">
											<span>Shipping</span>
											<span>Free</span>
										</div>
										<div className="flex justify-between font-semibold mt-2">
											<span>Total</span>
											<span>${cart.total_price.toFixed(2)}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
