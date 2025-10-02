'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
	Home,
	Leaf,
	AlertTriangle,
	ShoppingBag,
	MessageSquare,
	Menu,
	User,
	Settings,
	LogOut,
	ShoppingCart,
	Package,
	Clover,
} from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'

export function Header() {
	const [isOpen, setIsOpen] = useState(false)
	const { isAuthenticated, loading, logout } = useAuth()
	const router = useRouter()

	const handleLogout = async () => {
		await logout()
		router.push('/login')
	}

	const navItems = [
		{ href: '/', icon: Home, label: 'Home' },
		...(isAuthenticated
			? [
					{ href: '/track', icon: Leaf, label: 'My Plants' },
					{ href: '/chat', icon: MessageSquare, label: 'Chat' },
					{ href: '/plant-id', icon: Clover, label: 'Plant ID' },
					{ href: '/shop', icon: ShoppingBag, label: 'Store' },
					{ href: '/disease', icon: AlertTriangle, label: 'Disease Detection' },
			  ]
			: []),
	]

	if (loading) {
		return (
			<header className="bg-green-600 text-white">
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="flex justify-between items-stretch">
						<div className="animate-pulse h-12 w-48 bg-green-500 rounded"></div>
						<div className="animate-pulse h-12 w-96 bg-green-500 rounded hidden md:block"></div>
						<div className="animate-pulse h-12 w-48 bg-green-500 rounded hidden md:block"></div>
					</div>
				</div>
			</header>
		)
	}

	return (
		<header className="bg-green-600 text-white">
			<div className="container mx-auto px-4 max-w-7xl">
				<div className="flex justify-between items-stretch">
					<Link href="/" className="flex items-center space-x-2 py-3">
						<div className="relative h-full aspect-square">
							<Image
								src="/icon.png"
								alt=""
								fill
								style={{ objectFit: 'contain' }}
							/>
						</div>
						<span className="text-2xl font-bold">SproutBotanica</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex justify-center items-center w-[500px]">
						<div className="flex space-x-2">
							{navItems.map((item) => (
								<Link key={item.href} href={item.href}>
									<Button
										variant="ghost"
										className="text-white hover:text-green-200 hover:bg-green-700 transition-colors duration-200 px-2"
									>
										<item.icon className="h-4 w-4" />
										{item.label}
									</Button>
								</Link>
							))}
						</div>
					</nav>

					{/* Mobile Navigation */}
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								className="md:hidden text-white"
								onClick={() => setIsOpen(!isOpen)}
							>
								<Menu className="h-6 w-6" />
							</Button>
						</SheetTrigger>
						<SheetContent
							side="right"
							className="w-[300px] sm:w-[400px] bg-green-600"
						>
							<nav className="flex flex-col space-y-4 mt-8">
								{navItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsOpen(false)}
									>
										<Button
											variant="ghost"
											className="w-full justify-start text-white hover:text-green-200 hover:bg-green-700 transition-colors duration-200"
										>
											<item.icon className="mr-2 h-4 w-4" />
											{item.label}
										</Button>
									</Link>
								))}
								{isAuthenticated ? (
									<>
										<DropdownMenuSeparator />
										<Button
											variant="ghost"
											className="w-full justify-start text-white hover:text-green-200 hover:bg-green-700"
											onClick={handleLogout}
										>
											<LogOut className="mr-2 h-4 w-4" />
											Logout
										</Button>
									</>
								) : (
									<>
										<Link href="/login" onClick={() => setIsOpen(false)}>
											<Button
												variant="ghost"
												className="w-full justify-start text-white hover:text-green-200 hover:bg-green-700"
											>
												Login
											</Button>
										</Link>
										<Link href="/signup" onClick={() => setIsOpen(false)}>
											<Button
												variant="ghost"
												className="w-full justify-start text-white hover:text-green-200 hover:bg-green-700"
											>
												Sign Up
											</Button>
										</Link>
									</>
								)}
							</nav>
						</SheetContent>
					</Sheet>

					{/* Desktop Auth Buttons or User Profile */}
					<div className="hidden md:flex items-center space-x-2 min-w-[200px] justify-end">
						{isAuthenticated ? (
							<>
								<Link href="/cart">
									<Button
										variant="ghost"
										size="icon"
										className="text-white hover:text-green-200 hover:bg-green-700"
									>
										<ShoppingCart className="h-5 w-5" />
									</Button>
								</Link>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="text-white hover:text-green-200 hover:bg-green-700"
										>
											<User className="mr-2 h-4 w-4" />
											Profile
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuLabel>My Account</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link href="/orders" className="flex items-center gap-2">
												<Package className="h-4 w-4" />
												Orders
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href="/profile" className="flex items-center gap-2">
												<User className="h-4 w-4" />
												Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href="/settings"
												className="flex items-center gap-2"
											>
												<Settings className="h-4 w-4" />
												Settings
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={handleLogout}
											className="flex items-center gap-2 text-red-600"
										>
											<LogOut className="h-4 w-4" />
											Logout
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</>
						) : (
							<>
								<Link href="/login">
									<Button
										variant="outline"
										className="text-green-800 border-white hover:bg-green-700 hover:text-white rounded-full px-6 py-2 transition-all duration-200 shadow-md hover:shadow-lg"
									>
										Login
									</Button>
								</Link>
								<Link href="/signup">
									<Button className="bg-white text-green-600 hover:bg-green-100 hover:text-green-700 rounded-full px-6 py-2 transition-all duration-200 shadow-md hover:shadow-lg">
										Sign Up
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}
