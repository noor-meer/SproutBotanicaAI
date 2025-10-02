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
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { auth } from '@/utils/api'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-toastify'

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters long'),
		password2: z.string(),
	})
	.refine((data) => data.password === data.password2, {
		message: 'Passwords do not match',
		path: ['password2'],
	})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ServerErrors {
	[key: string]: string[] | string
}

export default function ResetPasswordPage({
	params,
}: {
	params: { token: string }
}) {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		mode: 'onChange',
	})

	const onSubmit = async (data: ResetPasswordFormData) => {
		try {
			await auth.resetPassword(params.token, data.password, data.password2)
			toast.success('Password has been reset successfully')
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
						setError(field as keyof ResetPasswordFormData, {
							type: 'server',
							message: errorMessage,
						})
					})
				}
			} else {
				setError('root', {
					type: 'server',
					message: 'An error occurred while resetting your password',
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
							Set New Password
						</CardTitle>
						<CardDescription className="text-center">
							Please enter your new password
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
								<Label htmlFor="password">New Password</Label>
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
								<Label htmlFor="password2">Confirm New Password</Label>
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
								{isSubmitting ? 'Resetting Password...' : 'Reset Password'}
							</Button>
						</form>
					</CardContent>
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
