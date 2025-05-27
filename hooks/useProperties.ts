import { useState, useEffect } from "react"
import type { Property } from "../types/Property"
import { propertiesService } from "@services/properties.service"

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await propertiesService.getAllProperties()

      // Assuming the API returns an array of properties
      const propertiesArray = Array.isArray(data) ? data : [data]
      setProperties(propertiesArray)

      const featured = propertiesArray
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
      setFeaturedProperties(featured)
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu")
      console.error("Error fetching properties:", err)
    } finally {
      setLoading(false)
    }
  }

  const refreshProperties = () => {
    fetchProperties()
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  return {
    properties,
    featuredProperties,
    loading,
    error,
    refreshProperties,
  }
}
