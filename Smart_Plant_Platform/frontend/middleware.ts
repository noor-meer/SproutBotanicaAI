import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define authentication routes that should redirect if already authenticated
const authRoutes = ['/login', '/signup']

// Define protected routes that require authentication
const protectedRoutes = [
	'/track',
	'/chat',
	'/plant-id',
	'/shop',
	'/disease',
	'/cart',
	'/orders',
	'/profile',
	'/settings',
]

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Get tokens from cookies
	const accessToken = request.cookies.get('accessToken')
	const refreshToken = request.cookies.get('refreshToken')

	// Consider authenticated if either token exists
	const isAuthenticated = !!(accessToken || refreshToken)

	// Allow public assets and API routes
	if (
		pathname === '/' ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname.startsWith('/static') ||
		pathname.includes('.')
	) {
		return NextResponse.next()
	}

	// Check if the path is a protected route
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	)

	// Check if the path is an auth route
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

	// If user is not authenticated and tries to access protected route
	if (!isAuthenticated && isProtectedRoute) {
		// Store the attempted URL to redirect back after login
		const response = NextResponse.redirect(new URL('/login', request.url))
		response.cookies.set('redirectTo', pathname)
		return response
	}

	// If user is authenticated and tries to access auth routes
	if (isAuthenticated && isAuthRoute) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

// Configure matcher for middleware
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * 1. _next/static (static files)
		 * 2. _next/image (image optimization files)
		 * 3. favicon.ico (favicon file)
		 * 4. public folder
		 */
		'/((?!_next/static|_next/image|favicon.ico|public/|icon.png).*)',
	],
}
