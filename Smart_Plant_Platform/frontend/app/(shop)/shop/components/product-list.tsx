import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: number
  name: string
  price: number
  image: string
}

interface ProductListProps {
  products: Product[]
  addToCart: (product: Product) => void
}

export function ProductList({ products, addToCart }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <CardHeader>
            <div className="relative w-full h-48">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardTitle>{product.name}</CardTitle>
            <p className="text-lg font-semibold mt-2">${product.price.toFixed(2)}</p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => addToCart(product)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

