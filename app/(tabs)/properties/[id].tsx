"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, Link } from "expo-router"
import { propertiesService } from "../../../services/properties.service"
import type { Property } from "../../../types/Property"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await propertiesService.getPropertyById(id as string)
          setProperty(data)
        } catch (err: any) {
          setError(err.message || "Không thể tải chi tiết tài sản.")
          console.error("Failed to fetch property details:", err)
        } finally {
          setLoading(false)
        }
      }
      fetchProperty()
    }
  }, [id])

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

  const handleContactPress = () => {
    if (property?.userId?.phone) {
      Alert.alert("Liên hệ", `Gọi điện cho ${property.userId.name}?`, [
        { text: "Hủy", style: "cancel" },
        { text: "Gọi ngay", onPress: () => console.log("Call:", property.userId.phone) },
      ])
    } else {
      Alert.alert("Thông báo", "Không có thông tin liên hệ")
    }
  }

  const handleFavoritePress = () => {
    Alert.alert("Thông báo", "Đã thêm vào danh sách yêu thích!")
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải chi tiết tài sản...</Text>
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
        </View>
      </SafeAreaView>
    )
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="home-outline" size={64} color="#9ca3af" />
          <Text style={styles.errorTitle}>Không tìm thấy tài sản</Text>
          <Text style={styles.errorText}>Tài sản này có thể đã bị xóa hoặc không tồn tại</Text>
        </View>
      </SafeAreaView>
    )
  }

  const images =
    property.images && property.images.length > 0 ? property.images : ["/placeholder.svg?height=300&width=400"]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width)
              setCurrentImageIndex(index)
            }}
          >
            {images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.propertyImage} />
            ))}
          </ScrollView>

          {/* Image Indicator */}
          {images.length > 1 && (
            <View style={styles.imageIndicator}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.indicatorDot, currentImageIndex === index && styles.indicatorDotActive]}
                />
              ))}
            </View>
          )}

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(property.status)}</Text>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
            <Ionicons name="heart-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Property Info */}
        <View style={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <Text style={styles.propertyPrice}>{formatPrice(property.price)}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={18} color="#6b7280" />
              <Text style={styles.locationText}>{property.location}</Text>
            </View>
          </View>

          {/* Property Details Grid */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailCard}>
                <Ionicons name="resize-outline" size={24} color="#2563eb" />
                <Text style={styles.detailLabel}>Diện tích</Text>
                <Text style={styles.detailValue}>{property.area}m²</Text>
              </View>
              <View style={styles.detailCard}>
                <Ionicons name="bed-outline" size={24} color="#2563eb" />
                <Text style={styles.detailLabel}>Phòng ngủ</Text>
                <Text style={styles.detailValue}>{property.bedrooms}</Text>
              </View>
              <View style={styles.detailCard}>
                <Ionicons name="water-outline" size={24} color="#2563eb" />
                <Text style={styles.detailLabel}>Phòng tắm</Text>
                <Text style={styles.detailValue}>{property.bathrooms}</Text>
              </View>
              <View style={styles.detailCard}>
                <Ionicons name="business-outline" size={24} color="#2563eb" />
                <Text style={styles.detailLabel}>Loại hình</Text>
                <Text style={styles.detailValue}>{getPropertyTypeLabel(property.propertyType)}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>{property.description}</Text>
          </View>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Tiện ích</Text>
              <View style={styles.amenitiesContainer}>
                {property.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Owner Info */}
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Ionicons name="person-circle-outline" size={48} color="#2563eb" />
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>{property.userId?.name || "N/A"}</Text>
                  <Text style={styles.ownerPhone}>{property.userId?.phone || "Chưa có số điện thoại"}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                <Ionicons name="call" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Timestamps */}
          <View style={styles.timestampSection}>
            <View style={styles.timestampItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.timestampText}>
                Đăng ngày: {new Date(property.createdAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
            <View style={styles.timestampItem}>
              <Ionicons name="refresh-outline" size={16} color="#6b7280" />
              <Text style={styles.timestampText}>
                Cập nhật: {new Date(property.updatedAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Link href={`/(tabs)/properties/${property._id}/edit`} asChild>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#2563eb" />
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.shareButton} onPress={handleContactPress}>
          <Ionicons name="call" size={20} color="#ffffff" />
          <Text style={styles.shareButtonText}>Liên hệ ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  imageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: width,
    height: 300,
    backgroundColor: "#f3f4f6",
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  indicatorDotActive: {
    backgroundColor: "#ffffff",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 32,
  },
  propertyPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#6b7280",
    marginLeft: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
  },
  amenitiesSection: {
    marginBottom: 24,
  },
  amenitiesContainer: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  amenityText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 12,
  },
  ownerSection: {
    marginBottom: 24,
  },
  ownerCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ownerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  ownerPhone: {
    fontSize: 14,
    color: "#6b7280",
  },
  contactButton: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    padding: 8,
  },
  timestampSection: {
    gap: 8,
  },
  timestampItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timestampText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2563eb",
    gap: 8,
  },
  editButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
})
