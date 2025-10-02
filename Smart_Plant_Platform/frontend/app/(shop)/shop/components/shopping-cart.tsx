import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Minus } from 'lucide-react'

interface Product {
  id: number
  name: string
  price: number
  image: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface ShoppingCartProps {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function ShoppingCart({ cart, setCart, isOpen, setIsOpen }: ShoppingCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    // checkout process
    console.log('Checkout submitted')
    setIsCheckingOut(false)
    setIsOpen(false)
    setCart([])
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout
          </SheetDescription>
        </SheetHeader>
        {cart.length === 0 ? (
          <p className="text-center mt-8">Your cart is empty</p>
        ) : (
          <div className="mt-8">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p>${item.product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, 0)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="mt-8 border-t pt-4">
              <p className="text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</p>
            </div>
            {!isCheckingOut ? (
              <Button
                onClick={() => setIsCheckingOut(true)}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                Proceed to Checkout
              </Button>
            ) : (
              <form onSubmit={handleCheckout} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" required />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Your Address" required />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Complete Purchase
                </Button>
              </form>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

