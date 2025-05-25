"use client"

import { useState, useCallback } from "react"
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useSession } from "../../context/AuthContext"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import type { Property } from "../../types/Property"
import { getPropertyTypeLabel , formatPrice } from "../../utils/validation"
import { useProperties } from "../../hooks/useProperties"


// Search Component
const Search = ({ onSearchPress }: { onSearchPress: () => void }) => {
  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity style={styles.searchBox} onPress={onSearchPress}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Tìm kiếm bất động sản...</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton}>
        <Ionicons name="options" size={20} color="#2563eb" />
      </TouchableOpacity>
    </View>
  )
}

// Featured Card Component
const FeaturedCard = ({ item, onPress }: { item: Property; onPress: () => void }) => {
  const mainImage = item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg?height=200&width=300"

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress}>
      <Image source={{ uri: mainImage }} style={styles.featuredImage} />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.featuredPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.featuredDetails}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.featuredLocation} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View style={styles.featuredSpecs}>
          <Text style={styles.featuredSpec}>{item.area}m²</Text>
          <Text style={styles.featuredSpec}>•</Text>
          <Text style={styles.featuredSpec}>{item.bedrooms} PN</Text>
          <Text style={styles.featuredSpec}>•</Text>
          <Text style={styles.featuredSpec}>{getPropertyTypeLabel(item.propertyType)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Property Card Component
const PropertyCard = ({ item, onPress }: { item: Property; onPress: () => void }) => {
  const mainImage = item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg?height=150&width=200"

  return (
    <TouchableOpacity style={styles.propertyCard} onPress={onPress}>
      <Image source={{ uri: mainImage }} style={styles.propertyImage} />
      <View style={styles.propertyContent}>
        <Text style={styles.propertyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.propertyPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.propertyDetails}>
          <View style={styles.propertyDetailItem}>
            <Ionicons name="location-outline" size={12} color="#6b7280" />
            <Text style={styles.propertyDetailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.propertyDetailItem}>
            <Ionicons name="bed-outline" size={12} color="#6b7280" />
            <Text style={styles.propertyDetailText}>{item.bedrooms} PN</Text>
          </View>
          <View style={styles.propertyDetailItem}>
            <Ionicons name="resize-outline" size={12} color="#6b7280" />
            <Text style={styles.propertyDetailText}>{item.area}m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Filters Component
const Filters = ({ onFilterChange }: { onFilterChange: (filter: string) => void }) => {
  const [activeFilter, setActiveFilter] = useState("all")
  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "house", label: "Nhà phố" },
    { id: "apartment", label: "Chung cư" },
    { id: "villa", label: "Biệt thự" },
    { id: "land", label: "Đất nền" },
  ]

  const handleFilterPress = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange(filterId)
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[styles.filterChip, activeFilter === filter.id && styles.filterChipActive]}
          onPress={() => handleFilterPress(filter.id)}
        >
          <Text style={[styles.filterText, activeFilter === filter.id && styles.filterTextActive]}>{filter.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

export default function HomeScreen() {
  const { user } = useSession()
  const { properties, featuredProperties, loading, error, refreshProperties } = useProperties()
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Filter properties based on selected filter
  const handleFilterChange = useCallback(
    (filter: string) => {
      if (filter === "all") {
        setFilteredProperties(properties)
      } else {
        const filtered = properties.filter((property) => property.propertyType === filter)
        setFilteredProperties(filtered)
      }
    },
    [properties],
  )

  // Initialize filtered properties when properties load
  useState(() => {
    setFilteredProperties(properties)
  }, [properties])

  const handleCardPress = (id: string) => {
    router.push(`/properties/${id}`)
  }

  const handleSearchPress = () => {
    router.push("/(tabs)/search")
  }

  const handleSeeAllFeatured = () => {
    router.push("/(tabs)/properties")
  }

  const handleSeeAllProperties = () => {
    router.push("/(tabs)/properties")
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshProperties()
    setRefreshing(false)
  }, [refreshProperties])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
  }

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <PropertyCard item={item} onPress={() => handleCardPress(item._id)} />
  )

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshProperties}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredProperties}
        renderItem={renderPropertyItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="home-outline" size={48} color="#9ca3af" />
              <Text style={styles.noResultsText}>Không có bất động sản nào</Text>
              <Text style={styles.noResultsSubtext}>Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</Text>
            </View>
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* User Header */}
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Image
                  source={{
                    uri: user?.avatar || "/placeholder.svg?height=48&width=48",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.userText}>
                  <Text style={styles.greeting}>{getGreeting()}</Text>
                  <Text style={styles.userName}>{user?.name || "Người dùng"}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color="#374151" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <Search onSearchPress={handleSearchPress} />

            {/* Featured Section */}
            {featuredProperties.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Nổi bật</Text>
                  <TouchableOpacity onPress={handleSeeAllFeatured}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={featuredProperties}
                  renderItem={({ item }) => <FeaturedCard item={item} onPress={() => handleCardPress(item._id)} />}
                  keyExtractor={(item) => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                />
              </View>
            )}

            {/* Recommended Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Có thể bạn quan tâm</Text>
              <TouchableOpacity onPress={handleSeeAllProperties}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            <Filters onFilterChange={handleFilterChange} />
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContainer: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
  },
  userText: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "400",
  },
  userName: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    marginTop: 2,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#9ca3af",
  },
  filterButton: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  featuredList: {
    paddingRight: 20,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f3f4f6",
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 8,
  },
  featuredDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featuredLocation: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
    flex: 1,
  },
  featuredSpecs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredSpec: {
    fontSize: 12,
    color: "#6b7280",
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filterChip: {
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#2563eb",
  },
  propertyCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#f3f4f6",
  },
  propertyContent: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 18,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 8,
  },
  propertyDetails: {
    gap: 4,
  },
  propertyDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyDetailText: {
    fontSize: 11,
    color: "#6b7280",
    marginLeft: 4,
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  noResults: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
})
