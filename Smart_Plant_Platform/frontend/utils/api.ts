import axios, { AxiosResponse } from 'axios'

interface LoginResponse {
	access: string
	refresh: string
}

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
})

// Auth endpoints
export const auth = {
	login: (
		email: string,
		password: string
	): Promise<AxiosResponse<LoginResponse>> =>
		api.post('/auth/login/', { email, password }),
	register: (
		email: string,
		username: string,
		password: string,
		password2: string
	) => api.post('/auth/register/', { email, username, password, password2 }),
	verify: (email: string, otp: string) =>
		api.post('/auth/verify/', { email, otp }),
	requestPasswordReset: (email: string) =>
		api.post('/auth/password-reset/', { email }),
	resetPassword: (token: string, password: string, password2: string) =>
		api.post('/auth/password-reset/confirm/', { token, password, password2 }),
	logout: () => {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		window.location.href = '/login'
	},
}

export default api
