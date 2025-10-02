import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { PlaceholderImage } from '@/components/ui/placeholder-image'

interface PlantCardProps {
	id: number
	name: string
	imageUrl?: string | null
}

export function PlantCard({ id, name, imageUrl }: PlantCardProps) {
	return (
		<Link href={`/track/${id}`}>
			<Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer">
				<div className="relative h-48 w-full">
					{imageUrl ? (
						<Image
							src={imageUrl}
							alt={name}
							fill
							style={{ objectFit: 'cover' }}
						/>
					) : (
						<PlaceholderImage text={name} width={400} height={200} />
					)}
				</div>
				<CardContent className="p-4">
					<h3 className="font-semibold text-lg">{name}</h3>
				</CardContent>
			</Card>
		</Link>
	)
}
