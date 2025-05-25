import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { propertiesService } from "../../../services/properties.service";
import { Property } from "../../../types/Property";
import { Link, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function PropertiesListScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const data = await propertiesService.getPropertiesByUser(userId);
      console.log("Fetched user properties:", data);
      setProperties(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách tài sản.");
      console.error("Failed to fetch properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const formatPrice = (price: number): string => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu`;
    } else {
      return `${price.toLocaleString("vi-VN")} VNĐ`;
    }
  };

  const getPropertyTypeLabel = (type: string): string => {
    const typeLabels: { [key: string]: string } = {
      apartment: "Chung cư",
      house: "Nhà phố",
      villa: "Biệt thự",
      land: "Đất nền",
    };
    return typeLabels[type] || type;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "available":
        return "#10b981";
      case "sold":
        return "#ef4444";
      case "rented":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "sold":
        return "Đã bán";
      case "rented":
        return "Đã cho thuê";
      default:
        return status;
    }
  };

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
              await propertiesService.deleteProperty(id);
              fetchProperties();
            } catch (error) {
              Alert.alert(
                "Lỗi",
                "Không thể xóa tài sản. Vui lòng thử lại sau."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderPropertyCard = ({ item }: { item: Property }) => {
    const mainImage =
      item.images && item.images.length > 0
        ? item.images[0]
        : "/placeholder.svg?height=200&width=300";

    return (
      <View style={styles.propertyCard}>
        <Link href={`/(tabs)/properties/${item._id}`} asChild>
          <TouchableOpacity style={styles.cardContent}>
            <Image source={{ uri: mainImage }} style={styles.propertyImage} />

            <View style={styles.propertyInfo}>
              <View style={styles.headerRow}>
                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.propertyPrice}>
                {formatPrice(item.price)}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text style={styles.propertyLocation} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="resize-outline" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{item.area}m²</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="bed-outline" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{item.bedrooms} PN</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="water-outline" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{item.bathrooms} PT</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="business-outline" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>
                    {getPropertyTypeLabel(item.propertyType)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.actionsRow}>
          <Link href={`/(tabs)/properties/${item._id}/edit`} asChild>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color="#2563eb" />
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải danh sách tài sản...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={fetchProperties}
            style={styles.retryButton}
          >
            <Ionicons name="refresh-outline" size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài sản của tôi</Text>
        <Text style={styles.headerSubtitle}>
          {properties.length} bất động sản
        </Text>
      </View>

      {/* <Link href="/(tabs)/properties/create" asChild>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add-circle" size={24} color="#ffffff" />
          <Text style={styles.createButtonText}>Thêm tài sản mới</Text>
        </TouchableOpacity>
      </Link> */}

      {properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="home-outline" size={80} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Chưa có tài sản nào</Text>
          <Text style={styles.emptySubtitle}>
            Hãy thêm bất động sản đầu tiên của bạn
          </Text>
          {/* <Link href="/(tabs)/properties/create" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Ionicons name="add-circle" size={24} color="#ffffff" />
              <Text style={styles.createButtonText}>Thêm bài mới</Text>
            </TouchableOpacity>
          </Link> */}
          <Link href="/(tabs)/properties/create" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Ionicons name="add-circle" size={24} color="#ffffff" />
              <Text style={styles.createButtonText}>Thêm tài sản mới</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={renderPropertyCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563eb"]}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
  createButton: {
    paddingHorizontal: 20,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
});
