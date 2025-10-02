'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { auth } from '@/utils/api'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-toastify'

const resetSchema = z.object({
	email: z.string().email('Please enter a valid email address.'),
})

type ResetFormData = z.infer<typeof resetSchema>

interface ServerErrors {
	[key: string]: string[] | string
}

export default function ForgotPasswordPage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ResetFormData>({
		resolver: zodResolver(resetSchema),
		mode: 'onChange',
	})

	const onSubmit = async (data: ResetFormData) => {
		try {
			await auth.requestPasswordReset(data.email)
			toast.success('Password reset instructions have been sent to your email')
			router.push('/login')
		} catch (err) {
			const error = err as AxiosError<ServerErrors>
			if (error.response?.data) {
				const errorData = error.response.data
				if (typeof errorData === 'string') {
					setError('root', {
						type: 'server',
						message: errorData,
					})
				} else {
					Object.entries(errorData).forEach(([field, messages]) => {
						const errorMessage = Array.isArray(messages)
							? messages[0]
							: messages
						setError(field as keyof ResetFormData, {
							type: 'server',
							message: errorMessage,
						})
					})
				}
			} else {
				setError('root', {
					type: 'server',
					message: 'An error occurred while requesting password reset',
				})
			}
		}
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow flex items-center justify-center bg-gray-100 px-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-center">
							Reset Your Password
						</CardTitle>
						<CardDescription className="text-center">
							Enter your email address and we&apos;ll send you instructions to
							reset your password
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-4"
							noValidate
						>
							{errors.root && (
								<div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
									{errors.root.message}
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									{...register('email')}
									className={
										errors.email ? 'border-red-500' : 'border-gray-300'
									}
								/>
								{errors.email && (
									<div className="text-sm text-red-500 mt-1">
										{errors.email.message}
									</div>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex justify-center">
						<p className="text-sm text-gray-600">
							Remember your password?{' '}
							<Link href="/login" className="text-green-600 hover:underline">
								Log in
							</Link>
						</p>
					</CardFooter>
				</Card>
			</main>
			<footer className="bg-green-600 text-white py-4">
				<div className="container mx-auto text-center">
					<p>&copy; 2023 SproutBotanica. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}
