"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plant } from "app/types"
import { Droplet, Calendar } from 'lucide-react'

export default function PlantList() {
  const [plants, setPlants] = useState<Plant[]>([])

  useEffect(() => {
    const savedPlants = localStorage.getItem("plants")
    if (savedPlants) {
      setPlants(JSON.parse(savedPlants))
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plants.map((plant) => (
        <Card key={plant.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-green-100">
            <CardTitle className="text-green-700">{plant.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center mb-2">
              <Droplet className="h-5 w-5 text-blue-500 mr-2" />
              <p>Water every {plant.waterFrequency} days</p>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <p>Last watered: {new Date(plant.lastWatered).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

