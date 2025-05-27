import { useState, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { propertiesService } from "../../../services/properties.service"
import type { Property } from "../../../types/Property"
import { Link, useFocusEffect, router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { FloatingActionButton } from "../../../components/FloatingActionButton"
import { PropertyFilterModal, type FilterOptions, type PropertyType } from "../../../components/PropertyFilterModal"

const { width } = Dimensions.get("window")

export default function PropertiesListScreen() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    propertyTypes: [],
    priceRange: "all",
  })

  const fetchProperties = async () => {
    setLoading(true)
    setError(null)
    try {
      const userId = await AsyncStorage.getItem("userId")
      if (!userId) {
        throw new Error("Không tìm thấy thông tin người dùng")
      }
      const data = await propertiesService.getPropertiesByUser(userId)
      console.log("Fetched user properties:", data)
      const propertiesArray = Array.isArray(data) ? data : []
      setProperties(propertiesArray)

      // Apply current filters to new data
      const filtered = applyFilters(propertiesArray, activeFilters)
      setFilteredProperties(filtered)
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách tài sản.")
      console.error("Failed to fetch properties:", err)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchProperties()
    setRefreshing(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchProperties()
    }, []),
  )

  const handleCreatePress = () => {
    router.push("/(tabs)/properties/create")
  }

  const formatPrice = (price: number): string => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu`
    } else {
      return `${price.toLocaleString("vi-VN")} VNĐ`
    }
  }

  const getPropertyTypeLabel = (type: string): string => {
    const typeLabels: { [key: string]: string } = {
      apartment: "Chung cư",
      house: "Nhà phố",
      villa: "Biệt thự",
      land: "Đất nền",
    }
    return typeLabels[type] || type
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "available":
        return "#10b981"
      case "sold":
        return "#ef4444"
      case "rented":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "available":
        return "Có sẵn"
      case "sold":
        return "Đã bán"
      case "rented":
        return "Đã cho thuê"
      default:
        return status
    }
  }

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tài sản này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await propertiesService.deleteProperty(id)
              fetchProperties()
              Alert.alert("Thành công", "Tài sản đã được xóa thành công!")
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa tài sản. Vui lòng thử lại sau.")
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  const applyFilters = (properties: Property[], filters: FilterOptions) => {
    let filtered = [...properties]

    // Filter by property type
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter((property) => filters.propertyTypes.includes(property.propertyType as PropertyType))
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((property) => property.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((property) => property.price <= filters.maxPrice!)
    }

    return filtered
  }

  const handleFilterApply = (filters: FilterOptions) => {
    setActiveFilters(filters)
    const filtered = applyFilters(properties, filters)
    setFilteredProperties(filtered)
  }

  const handleFilterClear = () => {
    setActiveFilters({
      propertyTypes: [],
      priceRange: "all",
    })
    setFilteredProperties(properties)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (activeFilters.propertyTypes.length > 0) count++
    if (activeFilters.priceRange !== "all" || activeFilters.minPrice || activeFilters.maxPrice) count++
    return count
  }

  const renderPropertyCard = ({ item }: { item: Property }) => {
    const mainImage = item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg?height=200&width=300"

    return (
      <View style={styles.propertyCard}>
        <Link href={`/(tabs)/properties/${item._id}`} asChild>
          <TouchableOpacity style={styles.cardContent} activeOpacity={0.8}>
            <Image source={{ uri: mainImage }} style={styles.propertyImage} />

            <View style={styles.propertyInfo}>
              <View style={styles.headerRow}>
                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {item.name || item.title}
                </Text>
                {item.status && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.propertyPrice}>{formatPrice(item.price)}</Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text style={styles.propertyLocation} numberOfLines={1}>
                  {item.address || item.location}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                {item.area && (
                  <View style={styles.detailItem}>
                    <Ionicons name="resize-outline" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.area}m²</Text>
                  </View>
                )}
                {item.bedrooms && (
                  <View style={styles.detailItem}>
                    <Ionicons name="bed-outline" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.bedrooms} PN</Text>
                  </View>
                )}
                {item.bathrooms && (
                  <View style={styles.detailItem}>
                    <Ionicons name="water-outline" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.bathrooms} PT</Text>
                  </View>
                )}
                {item.propertyType && (
                  <View style={styles.detailItem}>
                    <Ionicons name="business-outline" size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{getPropertyTypeLabel(item.propertyType)}</Text>
                  </View>
                )}
              </View>

              {/* Date */}
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                <Text style={styles.dateText}>
                  {new Date(item.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.actionsRow}>
          <Link href={`/(tabs)/properties/${item._id}/edit`} asChild>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={18} color="#2563eb" />
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="home-outline" size={80} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có tài sản nào</Text>
      <Text style={styles.emptySubtitle}>Hãy tạo tài sản đầu tiên của bạn để bắt đầu quản lý bất động sản</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleCreatePress} activeOpacity={0.8}>
        <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
        <Text style={styles.emptyButtonText}>Tạo tài sản mới</Text>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải danh sách tài sản...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchProperties} style={styles.retryButton} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <FloatingActionButton onPress={handleCreatePress} title="Tạo mới" icon="add" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tài sản của tôi</Text>
          <Text style={styles.headerSubtitle}>
            {filteredProperties.length > 0
              ? `${filteredProperties.length} bất động sản${filteredProperties.length !== properties.length ? ` (đã lọc từ ${properties.length})` : ""}`
              : "Chưa có tài sản"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/(tabs)/search")}>
            <Ionicons name="search-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, getActiveFiltersCount() > 0 && styles.headerButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter-outline" size={24} color={getActiveFiltersCount() > 0 ? "#2563eb" : "#374151"} />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Properties List */}
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item._id}
        renderItem={renderPropertyCard}
        contentContainerStyle={[styles.listContainer, properties.length === 0 && styles.listContainerEmpty]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} tintColor="#2563eb" />
        }
        ListEmptyComponent={<EmptyState />}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleCreatePress} title="Tạo mới" icon="add" loading={loading} />

      {/* Property Filter Modal */}
      <PropertyFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        currentFilters={activeFilters}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Space for FAB
  },
  listContainerEmpty: {
    flex: 1,
  },
  propertyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
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
  cardContent: {
    padding: 0,
  },
  propertyImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f3f4f6",
  },
  propertyInfo: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  propertyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginRight: 12,
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  propertyLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    borderRightWidth: 1,
    borderRightColor: "#f3f4f6",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  headerButtonActive: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
})
