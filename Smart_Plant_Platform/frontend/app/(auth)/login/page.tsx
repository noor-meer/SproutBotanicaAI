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
import Cookies from 'js-cookie'

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address.'),
	password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface ServerFieldErrors {
	[key: string]: string[] | string
}

interface ServerDetailError {
	detail: string | string[]
}

type ServerErrors = string | ServerFieldErrors | ServerDetailError

export default function LoginPage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
		shouldFocusError: true,
		shouldUnregister: false,
	})

	const onSubmit = async (data: LoginFormData) => {
		try {
			const response = await auth.login(data.email, data.password)

			if (response.data.access && response.data.refresh) {
				Cookies.set('accessToken', response.data.access)
				Cookies.set('refreshToken', response.data.refresh)

				const redirectTo = Cookies.get('redirectTo')
				Cookies.remove('redirectTo')

				toast.success('🎉 Login successful!', {
					onClose: () => router.push(redirectTo || '/'),
				})
			}
		} catch (err) {
			const error = err as AxiosError<ServerErrors>
			if (error.response?.data) {
				const errorData = error.response.data

				if (typeof errorData === 'string') {
					setError('root', {
						type: 'server',
						message: errorData,
					})
				} else if ('detail' in errorData) {
					const detailMessage = Array.isArray(errorData.detail)
						? errorData.detail[0]
						: errorData.detail
					setError('root', {
						type: 'server',
						message: detailMessage,
					})
				} else {
					Object.entries(errorData as ServerFieldErrors).forEach(
						([field, messages]) => {
							const errorMessage = Array.isArray(messages)
								? messages[0]
								: messages
							setError(field as keyof LoginFormData, {
								type: 'server',
								message: errorMessage,
							})
						}
					)
				}
			} else {
				setError('root', {
					type: 'server',
					message: 'An error occurred during login',
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
							Welcome Back
						</CardTitle>
						<CardDescription className="text-center">
							Login to continue your green journey
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
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									{...register('password')}
									className={
										errors.password ? 'border-red-500' : 'border-gray-300'
									}
								/>
								{errors.password && (
									<div className="text-sm text-red-500 mt-1">
										{errors.password.message}
									</div>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? 'Logging in...' : 'Login'}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex flex-col space-y-2">
						<p className="text-sm text-gray-600">
							Don&apos;t have an account?{' '}
							<Link href="/signup" className="text-green-600 hover:underline">
								Sign up
							</Link>
						</p>
						{/* <Link
							href="/forgot-password"
							className="text-sm text-green-600 hover:underline"
						>
							Forgot your password?
						</Link> */}
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
