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

const signupSchema = z
	.object({
		email: z.string().email('Please enter a valid email address.'),
		username: z
			.string()
			.min(3, 'Username must be at least 3 characters.')
			.max(20, 'Username must be at most 20 characters.')
			.regex(
				/^[a-zA-Z0-9_]+$/,
				'Username can only contain letters, numbers, and underscores.'
			),
		password: z.string().min(8, 'Password must be at least 8 characters long.'),
		password2: z.string(),
	})
	.refine((data) => data.password === data.password2, {
		message: 'Passwords do not match.',
		path: ['password2'],
	})

type SignupFormData = z.infer<typeof signupSchema>

interface ServerErrors {
	error?: string
	[key: string]: string[] | string | undefined
}

export default function SignupPage() {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		mode: 'onChange',
	})

	const onSubmit = async (data: SignupFormData) => {
		try {
			const response = await auth.register(
				data.email,
				data.username,
				data.password,
				data.password2
			)

			if (response.data.user) {
				router.push(
					`/verify?email=${encodeURIComponent(response.data.user.email)}`
				)
			}
		} catch (err) {
			const error = err as AxiosError<ServerErrors>
			if (error.response?.data) {
				const errorData = error.response.data
				if (errorData.error) {
					setError('root', {
						type: 'server',
						message: errorData.error,
					})
				} else {
					Object.entries(errorData).forEach(([field, messages]) => {
						const errorMessage = Array.isArray(messages)
							? messages[0]
							: messages
						setError(field as keyof SignupFormData, {
							type: 'server',
							message: errorMessage,
						})
					})
				}
			} else {
				setError('root', {
					type: 'server',
					message: 'An error occurred during registration',
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
							Sign up for SproutBotanica
						</CardTitle>
						<CardDescription className="text-center">
							Create your account and start your green journey
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
								<Label htmlFor="username">Username</Label>
								<Input
									id="username"
									type="text"
									placeholder="johndoe"
									{...register('username')}
									className={
										errors.username ? 'border-red-500' : 'border-gray-300'
									}
								/>
								{errors.username && (
									<div className="text-sm text-red-500 mt-1">
										{errors.username.message}
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
							<div className="space-y-2">
								<Label htmlFor="password2">Confirm Password</Label>
								<Input
									id="password2"
									type="password"
									{...register('password2')}
									className={
										errors.password2 ? 'border-red-500' : 'border-gray-300'
									}
								/>
								{errors.password2 && (
									<div className="text-sm text-red-500 mt-1">
										{errors.password2.message}
									</div>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? 'Signing up...' : 'Sign Up'}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex justify-center">
						<p className="text-sm text-gray-600">
							Already have an account?{' '}
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
