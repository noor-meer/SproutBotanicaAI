'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { auth } from '@/utils/api'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

const verifySchema = z.object({
	otp: z.string().length(6, 'OTP must be 6 digits'),
})

type VerifyFormData = z.infer<typeof verifySchema>

interface ServerErrors {
	error?: string
	[key: string]: string[] | string | undefined
}

export default function VerifyPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const email = searchParams.get('email')

	useEffect(() => {
		if (!email) {
			router.push('/signup')
		}
	}, [email, router])

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<VerifyFormData>({
		resolver: zodResolver(verifySchema),
		mode: 'onChange',
	})

	const onSubmit = async (data: VerifyFormData) => {
		try {
			const response = await auth.verify(email!, data.otp)

			// Show success message
			if (response.data.message) {
				toast.success('🎉 Account verified successfully!', {
					onClose: () => {
						router.push('/login')
					},
				})
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
						setError(field as keyof VerifyFormData, {
							type: 'server',
							message: errorMessage,
						})
					})
				}
			} else {
				setError('root', {
					type: 'server',
					message: 'An error occurred during verification',
				})
			}
		}
	}

	if (!email) {
		return null
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow flex items-center justify-center bg-gray-100 px-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-center">
							Verify Your Email
						</CardTitle>
						<CardDescription className="text-center">
							Please enter the verification code sent to {email}
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
								<Label htmlFor="otp">Verification Code</Label>
								<Input
									id="otp"
									type="text"
									placeholder="Enter 6-digit code"
									maxLength={6}
									{...register('otp')}
									className={errors.otp ? 'border-red-500' : 'border-gray-300'}
								/>
								{errors.otp && (
									<div className="text-sm text-red-500 mt-1">
										{errors.otp.message}
									</div>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? 'Verifying...' : 'Verify Email'}
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
