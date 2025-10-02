"use client"

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const images = [
  { src: '/Main Banner.svg', alt: 'Plant 1' },
  { src: '/Banner 1(WO Button).svg', alt: 'Plant 2' },
  { src: '/Banner 2(WO Button).svg', alt: 'Plant 3' },
  { src: '/Banner 3(WO Button).svg', alt: 'Plant 4' },
  { src: '/Banner 4(WO Button).svg', alt: 'Plant 5' },
]

export function ImageSlider() {
  const [currentImage, setCurrentImage] = useState(0)

  const nextImage = useCallback(() => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length)
  }, [])

  const prevImage = useCallback(() => {
    setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextImage, 5000)
    return () => clearInterval(timer)
  }, [nextImage])

  return (
    <div className="relative w-full overflow-hidden group">
      {/* Aspect ratio container */}
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}> {/* 16:9 aspect ratio */}
        {images.map((image, index) => (
          <Image
            key={index}
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            style={{
              objectFit: 'cover',
              transition: 'opacity 1s ease-in-out',
            }}
            className={`absolute top-0 left-0 w-full h-full ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
            priority={index === 0}
          />
        ))}
      </div>
      {/* Navigation buttons */}
      <div className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 hover:bg-white text-gray-800 w-8 h-8 md:w-10 md:h-10"
          onClick={prevImage}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </div>
      <div className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/80 hover:bg-white text-gray-800 w-8 h-8 md:w-10 md:h-10"
          onClick={nextImage}
          aria-label="Next image"
        >
          <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
        </Button>
      </div>
      {/* Pagination dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImage ? 'bg-white scale-125' : 'bg-white/50'
            }`}
            onClick={() => setCurrentImage(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

