import axios from '../utils/axios'

export interface Category {
	id: number
	name: string
	slug: string
	description: string
	created_at: string
	updated_at: string
}

export interface Product {
	id: number
	name: string
	slug: string
	category: number
	category_name: string
	description: string
	price: number
	stock: number
	image: string
	is_active: boolean
	created_at: string
	updated_at: string
}

export interface CartItem {
	id: number
	product: number
	product_name: string
	product_price: string
	product_image: string
	quantity: number
	subtotal: number
	created_at: string
	updated_at: string
}

export interface Cart {
	id: number
	items: CartItem[]
	total_price: number
	created_at: string
	updated_at: string
}

export interface OrderItem {
	id: number
	product: number
	product_name: string
	quantity: number
	price: number
	subtotal: number
	created_at: string
}

export interface Order {
	id: number
	user: number
	user_email: string
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
	total_price: number
	shipping_address: string
	items: OrderItem[]
	created_at: string
	updated_at: string
}

export interface PlantNote {
	id: number
	content: string
	created_at: string
	updated_at: string
}

export interface CareRoutine {
	id: number
	task: string
	frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
	instructions: string
	last_performed: string | null
	next_due: string | null
}

export interface GrowthRecord {
	id: number
	height: number | null
	width: number | null
	num_leaves: number | null
	notes: string
	image: string | null
	recorded_at: string
}

export interface UserPlant {
	id: number
	name: string
	description: string
	image: string | null
	created_at: string
	updated_at: string
	notes: PlantNote[]
	care_routines: CareRoutine[]
	growth_records: GrowthRecord[]
}

const store = {
	// Categories
	getCategories: () => axios.get<Category[]>('/store/categories/'),
	getCategory: (id: number) => axios.get<Category>(`/store/categories/${id}/`),

	// Products
	getProducts: (category?: string) =>
		axios.get<Product[]>('/store/products/', { params: { category } }),
	getProduct: (slug: string) => axios.get<Product>(`/store/products/${slug}/`),

	// Cart
	getCart: () => axios.get<Cart[]>('/store/cart/'),
	addToCart: (productId: number, quantity: number = 1) =>
		axios.post<CartItem>(`/store/cart/${productId}/add_item/`, {
			product: productId,
			quantity,
		}),
	removeFromCart: (productId: number) =>
		axios.post(`/store/cart/${productId}/remove_item/`, { product: productId }),
	updateCartItemQuantity: (productId: number, quantity: number) =>
		axios.post<CartItem>(`/store/cart/${productId}/update_quantity/`, {
			product: productId,
			quantity,
		}),

	// Orders
	getOrders: () => axios.get<Order[]>('/store/orders/'),
	getOrder: (id: number) => axios.get<Order>(`/store/orders/${id}/`),
	createOrder: (shippingAddress: string) =>
		axios.post<Order>('/store/orders/', { shipping_address: shippingAddress }),

	// Plant tracking functions
	getUserPlants: () => axios.get<UserPlant[]>('/plants/'),
	getUserPlant: (id: number) => axios.get<UserPlant>(`/plants/${id}/`),
	createUserPlant: (data: FormData) =>
		axios.post<UserPlant>('/plants/', data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),
	updateUserPlant: (id: number, data: FormData) =>
		axios.put<UserPlant>(`/plants/${id}/`, data),
	deleteUserPlant: (id: number) => axios.delete(`/plants/${id}/`),

	// Plant notes
	addPlantNote: (plantId: number, content: string) =>
		axios.post<PlantNote>(`/plants/${plantId}/add_note/`, { content }),
	deletePlantNote: (plantId: number, noteId: number) =>
		axios.delete(`/plants/${plantId}/notes/${noteId}/`),

	// Care routines
	addCareRoutine: (
		plantId: number,
		data: { task: string; frequency: string; instructions: string }
	) => axios.post<CareRoutine>(`/plants/${plantId}/add_care_routine/`, data),
	deleteCareRoutine: (plantId: number, routineId: number) =>
		axios.delete(`/plants/${plantId}/care_routines/${routineId}/`),
	completeCareTask: (plantId: number, routineId: number) =>
		axios.post<CareRoutine>(`/plants/${plantId}/complete_care_task/`, {
			routine_id: routineId,
		}),

	// Growth records
	recordGrowth: (plantId: number, data: FormData) =>
		axios.post<GrowthRecord>(`/plants/${plantId}/record_growth/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),
	deleteGrowthRecord: (plantId: number, recordId: number) =>
		axios.delete(`/plants/${plantId}/growth_records/${recordId}/`),
}

export default store
