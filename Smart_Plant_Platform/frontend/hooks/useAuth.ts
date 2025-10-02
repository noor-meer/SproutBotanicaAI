import { useState, useEffect } from 'react'
import { auth } from '@/utils/api'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		const token = Cookies.get('accessToken')
		if (token) {
			setIsAuthenticated(true)
		}
		setLoading(false)
	}, [])

	const logout = async () => {
		try {
			const refreshToken = Cookies.get('refreshToken')
			if (refreshToken) {
				await auth.logout()
			}
		} catch (error) {
			console.error('Error during logout:', error)
		} finally {
			Cookies.remove('accessToken')
			Cookies.remove('refreshToken')
			Cookies.remove('redirectTo')
			setIsAuthenticated(false)
			router.push('/login')
		}
	}

	return { isAuthenticated, loading, logout }
}
