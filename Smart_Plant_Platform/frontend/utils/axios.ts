import axios from 'axios'
import Cookies from 'js-cookie'

const instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
	headers: {
		'Content-Type': 'application/json',
	},
})

instance.interceptors.request.use(
	(config) => {
		const token = Cookies.get('accessToken')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

instance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			Cookies.remove('accessToken')
			Cookies.remove('refreshToken')
			window.location.href = '/login'
		}
		return Promise.reject(error)
	}
)

export default instance
