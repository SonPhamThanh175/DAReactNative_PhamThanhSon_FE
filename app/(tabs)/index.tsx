import { useState, useCallback, useEffect } from "react"
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
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useAsyncStorage } from "../../hooks/useAsyncStorage"
import type { Property } from "../../types/Property"
import { getPropertyTypeLabel, formatPrice } from "../../utils/validation"
import { useProperties } from "../../hooks/useProperties"
import { PropertyFilterModal, type FilterOptions, type PropertyType } from "../../components/PropertyFilterModal"

// Search Component
const Search = ({
  onSearchPress,
  onFilterPress,
  hasActiveFilters,
}: {
  onSearchPress: () => void
  onFilterPress: () => void
  hasActiveFilters: boolean
}) => {
  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity style={styles.searchBox} onPress={onSearchPress}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Tìm kiếm bất động sản...</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
        onPress={onFilterPress}
      >
        <Ionicons name="options" size={20} color={hasActiveFilters ? "#2563eb" : "#6b7280"} />
        {hasActiveFilters && (
          <View style={styles.filterBadge}>
            <View style={styles.filterBadgeDot} />
          </View>
        )}
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
          {item.name || item.title}
        </Text>
        <Text style={styles.featuredPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.featuredDetails}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.featuredLocation} numberOfLines={1}>
            {item.address || item.location}
          </Text>
        </View>
        <View style={styles.featuredSpecs}>
          {item.area && <Text style={styles.featuredSpec}>{item.area}m²</Text>}
          {item.area && item.bedrooms && <Text style={styles.featuredSpec}>•</Text>}
          {item.bedrooms && <Text style={styles.featuredSpec}>{item.bedrooms} PN</Text>}
          {(item.area || item.bedrooms) && item.propertyType && <Text style={styles.featuredSpec}>•</Text>}
          {item.propertyType && <Text style={styles.featuredSpec}>{getPropertyTypeLabel(item.propertyType)}</Text>}
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
          {item.name || item.title}
        </Text>
        <Text style={styles.propertyPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.propertyDetails}>
          <View style={styles.propertyDetailItem}>
            <Ionicons name="location-outline" size={12} color="#6b7280" />
            <Text style={styles.propertyDetailText} numberOfLines={1}>
              {item.address || item.location}
            </Text>
          </View>
          {item.bedrooms && (
            <View style={styles.propertyDetailItem}>
              <Ionicons name="bed-outline" size={12} color="#6b7280" />
              <Text style={styles.propertyDetailText}>{item.bedrooms} PN</Text>
            </View>
          )}
          {item.area && (
            <View style={styles.propertyDetailItem}>
              <Ionicons name="resize-outline" size={12} color="#6b7280" />
              <Text style={styles.propertyDetailText}>{item.area}m²</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Quick Filters Component
const QuickFilters = ({
  onFilterChange,
  activeFilter,
}: {
  onFilterChange: (filter: string) => void
  activeFilter: string
}) => {
  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "house", label: "Nhà phố" },
    { id: "apartment", label: "Chung cư" },
    { id: "villa", label: "Biệt thự" },
    { id: "land", label: "Đất nền" },
  ]

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[styles.filterChip, activeFilter === filter.id && styles.filterChipActive]}
          onPress={() => onFilterChange(filter.id)}
        >
          <Text style={[styles.filterText, activeFilter === filter.id && styles.filterTextActive]}>{filter.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

export default function HomeScreen() {
  const { user, loading: userLoading } = useAsyncStorage()
  const { properties, featuredProperties, loading, error, refreshProperties } = useProperties()
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [quickFilter, setQuickFilter] = useState("all")
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    propertyTypes: [],
    priceRange: "all",
  })

  // Apply both quick filter and advanced filters
  const applyAllFilters = useCallback((props: Property[], quickFilterType: string, advancedFilters: FilterOptions) => {
    console.log("Applying filters:", { quickFilterType, advancedFilters, propsCount: props.length })
    let filtered = [...props]

    // Apply quick filter first
    if (quickFilterType !== "all") {
      console.log("Filtering by property type:", quickFilterType)
      filtered = filtered.filter((property) => {
        console.log("Property type:", property.type, "matches:", property.type === quickFilterType)
        return property.type === quickFilterType
      })
      console.log("After quick filter:", filtered.length)
    }

    // Apply advanced filters
    if (advancedFilters.propertyTypes.length > 0) {
      filtered = filtered.filter((property) =>
        advancedFilters.propertyTypes.includes(property.type as PropertyType),
      )
    }

    // Apply price filters
    if (advancedFilters.minPrice !== undefined) {
      filtered = filtered.filter((property) => property.price >= advancedFilters.minPrice!)
    }
    if (advancedFilters.maxPrice !== undefined) {
      filtered = filtered.filter((property) => property.price <= advancedFilters.maxPrice!)
    }

    console.log("Final filtered count:", filtered.length)
    return filtered
  }, [])

  // Handle quick filter change
  const handleQuickFilterChange = useCallback(
    (filter: string) => {
      console.log("Quick filter changed to:", filter)
      console.log("Properties count:", properties.length)
      setQuickFilter(filter)

      const filtered = applyAllFilters(properties, filter, activeFilters)
      console.log("Filtered properties count:", filtered.length)
      setFilteredProperties(filtered)
    },
    [properties, activeFilters, applyAllFilters],
  )

  // Handle advanced filter apply
  const handleAdvancedFilterApply = useCallback(
    (filters: FilterOptions) => {
      setActiveFilters(filters)
      const filtered = applyAllFilters(properties, quickFilter, filters)
      setFilteredProperties(filtered)
    },
    [properties, quickFilter, applyAllFilters],
  )

  // Handle filter clear
  const handleFilterClear = useCallback(() => {
    setActiveFilters({
      propertyTypes: [],
      priceRange: "all",
    })
    setQuickFilter("all")
    setFilteredProperties(properties)
  }, [properties])

  // Initialize filtered properties when properties load
  useEffect(() => {
    if (properties.length > 0) {
      const filtered = applyAllFilters(properties, quickFilter, activeFilters)
      setFilteredProperties(filtered)
    }
  }, [properties, quickFilter, activeFilters, applyAllFilters])

  const handleCardPress = (id: string) => {
    router.push(`/(tabs)/properties/id/${id}`)
  }

  // const handleSearchPress = () => {
  //   router.push("/(tabs)/search")
  // }

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

  const hasActiveFilters = () => {
    return (
      activeFilters.propertyTypes.length > 0 ||
      activeFilters.priceRange !== "all" ||
      activeFilters.minPrice !== undefined ||
      activeFilters.maxPrice !== undefined
    )
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
              {hasActiveFilters() && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={handleFilterClear}>
                  <Ionicons name="refresh-outline" size={16} color="#2563eb" />
                  <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              )}
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
                  <Text style={styles.userName}>{userLoading ? "Đang tải..." : user?.name || "Người dùng"}</Text>
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
            <Search
              onSearchPress={handleSearchPress}
              onFilterPress={() => setFilterModalVisible(true)}
              hasActiveFilters={hasActiveFilters()}
            />

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

            {/* Filter Results Info */}
            {(hasActiveFilters() || quickFilter !== "all") && (
              <View style={styles.filterResultsInfo}>
                <Text style={styles.filterResultsText}>
                  Hiển thị {filteredProperties.length} kết quả
                  {filteredProperties.length !== properties.length && ` (từ ${properties.length} tài sản)`}
                </Text>
                {hasActiveFilters() && (
                  <TouchableOpacity onPress={handleFilterClear}>
                    <Text style={styles.clearAllFiltersText}>Xóa tất cả</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <QuickFilters onFilterChange={handleQuickFilterChange} activeFilter={quickFilter} />
          </View>
        }
      />

      {/* Property Filter Modal */}
      <PropertyFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleAdvancedFilterApply}
        onClear={handleFilterClear}
        currentFilters={activeFilters}
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
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bfdbfe",
  },
  filterBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  filterBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
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
  filterResultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  filterResultsText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  clearAllFiltersText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
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
    marginBottom: 16,
  },
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
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
