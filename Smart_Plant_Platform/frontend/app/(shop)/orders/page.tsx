'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import store, { Order } from '@/utils/store'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		fetchOrders()
	}, [])

	const fetchOrders = async () => {
		try {
			const response = await store.getOrders()
			setOrders(response.data)
		} catch (error: unknown) {
			if (error instanceof AxiosError) {
				toast.error(error.response?.data?.error || 'Failed to load orders')
			} else {
				toast.error('Failed to load orders')
			}
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

	if (orders.length === 0) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-grow container mx-auto px-4 py-8">
					<Card>
						<CardContent className="py-8">
							<div className="text-center">
								<h2 className="text-2xl font-semibold mb-4">No orders found</h2>
								<Button onClick={() => router.push('/shop')}>
									Start Shopping
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
				<h1 className="text-3xl font-bold mb-8">Order History</h1>

				<div className="space-y-6">
					{orders.map((order) => (
						<Card key={order.id}>
							<CardHeader>
								<div className="flex justify-between items-center">
									<CardTitle>Order #{order.id}</CardTitle>
									<span
										className={`px-3 py-1 rounded-full text-sm ${
											order.status === 'delivered'
												? 'bg-green-100 text-green-800'
												: order.status === 'cancelled'
												? 'bg-red-100 text-red-800'
												: 'bg-yellow-100 text-yellow-800'
										}`}
									>
										{order.status.charAt(0).toUpperCase() +
											order.status.slice(1)}
									</span>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h3 className="font-medium mb-2">Order Items</h3>
										<div className="space-y-2">
											{order.items.map((item) => (
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
										</div>
									</div>
									<div className="border-t pt-4">
										<div className="flex justify-between">
											<span>Total</span>
											<span className="font-semibold">
												${Number(order.total_price).toFixed(2)}
											</span>
										</div>
									</div>
									<div>
										<h3 className="font-medium mb-2">Shipping Address</h3>
										<p className="text-gray-600">{order.shipping_address}</p>
									</div>
									<div className="text-sm text-gray-500">
										Ordered on {new Date(order.created_at).toLocaleDateString()}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</main>
		</div>
	)
}
