
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useLocalSearchParams, router, Stack } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { propertiesService } from "../../../../services/properties.service"
import type { Property } from "../../../../types/Property"
import { PropertyTypeSelector, type PropertyType } from "../../../../components/PropertyTypeSelector"

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [address, setAddress] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await propertiesService.getPropertyById(id as string)
          setProperty(data)
          setName(data.name)
          setDescription(data.description)
          setPrice(data.price.toString())
          setAddress(data.address)
          setImageUrl(data.imageUrl || "")
          setPropertyType(data.propertyType || null)
        } catch (err: any) {
          setError(err.message || "Không thể tải chi tiết tài sản để chỉnh sửa.")
          console.error("Failed to fetch property for edit:", err)
        } finally {
          setLoading(false)
        }
      }
      fetchProperty()
    }
  }, [id])

  const handleUpdateProperty = async () => {
    if (!name || !description || !price || !address || !propertyType) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường bắt buộc (Tên, Mô tả, Giá, Địa chỉ, Loại tài sản).")
      return
    }

    setSaving(true)
    try {
      await propertiesService.updateProperty(id as string, {
        name,
        description,
        price: Number.parseFloat(price.replace(/,/g, "")), // Remove commas before parsing
        address,
        propertyType,
        imageUrl: imageUrl || undefined,
      })
      Alert.alert("Thành công", "Tài sản đã được cập nhật thành công!")
      router.back()
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật tài sản.")
      console.error("Update property failed:", error)
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "")
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text)
    setPrice(formatted)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải tài sản...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="home-outline" size={48} color="#9ca3af" />
          <Text style={styles.errorText}>Không tìm thấy tài sản để chỉnh sửa.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa tài sản</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Property Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên tài sản <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên tài sản"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Loại tài sản <Text style={styles.required}>*</Text>
              </Text>
              <PropertyTypeSelector value={propertyType} onSelect={setPropertyType} placeholder="Chọn loại tài sản" />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mô tả <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#6b7280"
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Mô tả chi tiết về tài sản"
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Giá <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  value={price}
                  onChangeText={handlePriceChange}
                  keyboardType="numeric"
                />
                <Text style={styles.currency}>VNĐ</Text>
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Địa chỉ <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập địa chỉ"
                  placeholderTextColor="#9ca3af"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL hình ảnh</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="image-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor="#9ca3af"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={handleUpdateProperty}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.updateButtonText}>Đang lưu...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="save-outline" size={20} color="#ffffff" />
                <Text style={styles.updateButtonText}>Lưu thay đổi</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Required Fields Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
            <Text style={styles.noteText}>
              Các trường có dấu <Text style={styles.required}>*</Text> là bắt buộc
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 0,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  updateButtonDisabled: {
    backgroundColor: "#9ca3af",
    elevation: 1,
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
    textAlign: "center",
  },
})
