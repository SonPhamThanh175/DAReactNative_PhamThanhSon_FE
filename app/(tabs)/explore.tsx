"use client"

import { useState, useEffect } from "react"
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

// Mock data
const mockProperties = [
  {
    $id: "1",
    name: "Căn hộ cao cấp Vinhomes",
    address: "Quận 1, TP.HCM",
    price: 5000000000,
    image: "/placeholder.svg?height=200&width=300",
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 80,
    featured: true,
  },
  {
    $id: "2",
    name: "Nhà phố hiện đại",
    address: "Quận 7, TP.HCM",
    price: 8000000000,
    image: "/placeholder.svg?height=200&width=300",
    type: "house",
    bedrooms: 3,
    bathrooms: 3,
    area: 120,
    featured: false,
  },
  {
    $id: "3",
    name: "Villa view sông",
    address: "Quận 2, TP.HCM",
    price: 15000000000,
    image: "/placeholder.svg?height=200&width=300",
    type: "villa",
    bedrooms: 4,
    bathrooms: 4,
    area: 200,
    featured: true,
  },
  {
    $id: "4",
    name: "Căn hộ studio",
    address: "Quận 3, TP.HCM",
    price: 2500000000,
    image: "/placeholder.svg?height=200&width=300",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    featured: false,
  },
  {
    $id: "5",
    name: "Penthouse sang trọng",
    address: "Quận Bình Thạnh, TP.HCM",
    price: 25000000000,
    image: "/placeholder.svg?height=200&width=300",
    type: "penthouse",
    bedrooms: 5,
    bathrooms: 5,
    area: 300,
    featured: true,
  },
  {
    $id: "6",
    name: "Nhà mặt tiền",
    address: "Quận 10, TP.HCM",
    price: 12000000000,
    image: "/placeholder.svg?height=200&width=300",
    type: "house",
    bedrooms: 4,
    bathrooms: 3,
    area: 150,
    featured: false,
  },
]

export default function Explore() {
  const params = useLocalSearchParams<{ query?: string; filter?: string }>()
  const [properties, setProperties] = useState(mockProperties)
  const [filteredProperties, setFilteredProperties] = useState(mockProperties)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(params.query || "")
  const [selectedFilter, setSelectedFilter] = useState(params.filter || "all")

  const handleCardPress = (id: string) => {
    console.log("Navigating to:", `/properties/${id}`)
    router.push(`/properties/${id}`)
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`
    }
    return price.toLocaleString("vi-VN")
  }

  // Filter properties based on search and filter
  useEffect(() => {
    let filtered = properties

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (property) =>
          property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by type
    if (selectedFilter && selectedFilter !== "all") {
      filtered = filtered.filter((property) => property.type === selectedFilter)
    }

    setFilteredProperties(filtered)
  }, [searchQuery, selectedFilter, properties])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={filteredProperties}
        renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.$id)} />}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 120 }}
        columnWrapperStyle={{
          gap: 16,
          paddingHorizontal: 20,
          marginBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} /> : <NoResults />
        }
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#e0e7ff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#2563eb" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#374151",
                  textAlign: "center",
                  flex: 1,
                  marginHorizontal: 16,
                }}
              >
                Tìm kiếm ngôi nhà của bạn
              </Text>

              <TouchableOpacity
                onPress={() => {}}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                }}
              >
                <Ionicons name="notifications-outline" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <Search searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <View style={{ marginTop: 20 }}>
              <Filters selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#374151",
                  marginTop: 20,
                  marginBottom: 16,
                }}
              >
                Tìm thấy {filteredProperties?.length} kết quả
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  )
}

// Card Component
function Card({ item, onPress }: { item: any; onPress: () => void }) {
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`
    }
    return price.toLocaleString("vi-VN")
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: "white",
        borderRadius: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: "hidden",
      }}
      activeOpacity={0.8}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: item.image }}
          style={{
            width: "100%",
            height: 120,
            backgroundColor: "#f3f4f6",
          }}
          resizeMode="cover"
        />
        {item.featured && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "#ef4444",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 10,
                fontWeight: "600",
              }}
            >
              Nổi bật
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="heart-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Ionicons name="location-outline" size={12} color="#6b7280" />
          <Text
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginLeft: 4,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.address}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="bed-outline" size={12} color="#6b7280" />
            <Text
              style={{
                fontSize: 10,
                color: "#6b7280",
                marginLeft: 2,
              }}
            >
              {item.bedrooms}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="water-outline" size={12} color="#6b7280" />
            <Text
              style={{
                fontSize: 10,
                color: "#6b7280",
                marginLeft: 2,
              }}
            >
              {item.bathrooms}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: "#2563eb",
          }}
        >
          {formatPrice(item.price)} VNĐ
        </Text>
      </View>
    </TouchableOpacity>
  )
}

// Search Component
function Search({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (query: string) => void
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
      }}
    >
      <Ionicons name="search-outline" size={20} color="#6b7280" />
      <Text
        style={{
          flex: 1,
          fontSize: 16,
          color: searchQuery ? "#1f2937" : "#9ca3af",
          marginLeft: 12,
        }}
      >
        {searchQuery || "Tìm kiếm tài sản..."}
      </Text>
      {searchQuery && (
        <TouchableOpacity onPress={() => onSearchChange("")}>
          <Ionicons name="close-circle" size={20} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  )
}

// Filters Component
function Filters({
  selectedFilter,
  onFilterChange,
}: {
  selectedFilter: string
  onFilterChange: (filter: string) => void
}) {
  const filters = [
    { id: "all", name: "Tất cả", icon: "apps-outline" },
    { id: "apartment", name: "Căn hộ", icon: "business-outline" },
    { id: "house", name: "Nhà phố", icon: "home-outline" },
    { id: "villa", name: "Villa", icon: "library-outline" },
    { id: "penthouse", name: "Penthouse", icon: "business-outline" },
  ]

  return (
    <View>
      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onFilterChange(item.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: selectedFilter === item.id ? "#2563eb" : "#f9fafb",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 12,
              borderWidth: 1,
              borderColor: selectedFilter === item.id ? "#2563eb" : "#e5e7eb",
            }}
          >
            <Ionicons name={item.icon as any} size={16} color={selectedFilter === item.id ? "#ffffff" : "#6b7280"} />
            <Text
              style={{
                fontSize: 14,
                color: selectedFilter === item.id ? "#ffffff" : "#6b7280",
                marginLeft: 6,
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

// NoResults Component
function NoResults() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingVertical: 60,
      }}
    >
      <Ionicons name="search-outline" size={64} color="#d1d5db" />
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: "#374151",
          marginTop: 16,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Không tìm thấy kết quả
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: "#6b7280",
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn
      </Text>
    </View>
  )
}
