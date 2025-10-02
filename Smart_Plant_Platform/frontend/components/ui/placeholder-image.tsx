'use client'

export function PlaceholderImage({
	text = 'No Image',
	width = 400,
	height = 400,
}: {
	text?: string
	width?: number
	height?: number
}) {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label={`Placeholder image: ${text}`}
		>
			<rect width={width} height={height} fill="#E5E7EB" />
			<text
				x="50%"
				y="50%"
				dominantBaseline="middle"
				textAnchor="middle"
				fill="#6B7280"
				fontSize={width * 0.1}
				fontFamily="system-ui"
			>
				{text}
			</text>
		</svg>
	)
}
