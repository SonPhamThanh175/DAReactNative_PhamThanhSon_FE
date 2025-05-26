import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export type PropertyType = "apartment" | "house" | "villa" | "land"

export interface FilterOptions {
  propertyTypes: PropertyType[]
  minPrice?: number
  maxPrice?: number
  priceRange?: "all" | "under1" | "1to5" | "5to10" | "10to50" | "over50"
}

interface PropertyFilterModalProps {
  visible: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  onClear: () => void
  currentFilters: FilterOptions
}

const propertyTypeOptions = [
  {
    value: "apartment" as PropertyType,
    label: "Chung cư",
    icon: "business-outline",
    color: "#3b82f6",
  },
  {
    value: "house" as PropertyType,
    label: "Nhà phố",
    icon: "home-outline",
    color: "#10b981",
  },
  {
    value: "villa" as PropertyType,
    label: "Biệt thự",
    icon: "library-outline",
    color: "#8b5cf6",
  },
  {
    value: "land" as PropertyType,
    label: "Đất nền",
    icon: "map-outline",
    color: "#f59e0b",
  },
]

const priceRangeOptions = [
  { value: "all", label: "Tất cả mức giá", min: 0, max: Number.POSITIVE_INFINITY },
  { value: "under1", label: "Dưới 1 tỷ", min: 0, max: 1000000000 },
  { value: "1to5", label: "1 - 5 tỷ", min: 1000000000, max: 5000000000 },
  { value: "5to10", label: "5 - 10 tỷ", min: 5000000000, max: 10000000000 },
  { value: "10to50", label: "10 - 50 tỷ", min: 10000000000, max: 50000000000 },
  { value: "over50", label: "Trên 50 tỷ", min: 50000000000, max: Number.POSITIVE_INFINITY },
]

export const PropertyFilterModal: React.FC<PropertyFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  onClear,
  currentFilters,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(currentFilters.propertyTypes)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(currentFilters.priceRange || "all")
  const [customMinPrice, setCustomMinPrice] = useState<string>(
    currentFilters.minPrice ? currentFilters.minPrice.toString() : "",
  )
  const [customMaxPrice, setCustomMaxPrice] = useState<string>(
    currentFilters.maxPrice ? currentFilters.maxPrice.toString() : "",
  )
  const [useCustomPrice, setUseCustomPrice] = useState(false)

  const togglePropertyType = (type: PropertyType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleApply = () => {
    const filters: FilterOptions = {
      propertyTypes: selectedTypes,
    }

    if (useCustomPrice) {
      if (customMinPrice) filters.minPrice = Number.parseFloat(customMinPrice.replace(/,/g, ""))
      if (customMaxPrice) filters.maxPrice = Number.parseFloat(customMaxPrice.replace(/,/g, ""))
    } else {
      filters.priceRange = selectedPriceRange as any
      const range = priceRangeOptions.find((r) => r.value === selectedPriceRange)
      if (range && range.value !== "all") {
        filters.minPrice = range.min
        filters.maxPrice = range.max === Number.POSITIVE_INFINITY ? undefined : range.max
      }
    }

    onApply(filters)
    onClose()
  }

  const handleClear = () => {
    setSelectedTypes([])
    setSelectedPriceRange("all")
    setCustomMinPrice("")
    setCustomMaxPrice("")
    setUseCustomPrice(false)
    onClear()
  }

  const formatPrice = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "")
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleMinPriceChange = (text: string) => {
    const formatted = formatPrice(text)
    setCustomMinPrice(formatted)
  }

  const handleMaxPriceChange = (text: string) => {
    const formatted = formatPrice(text)
    setCustomMaxPrice(formatted)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedTypes.length > 0) count++
    if (selectedPriceRange !== "all" || useCustomPrice) count++
    return count
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ lọc tài sản</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Property Types */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Loại tài sản</Text>
              <View style={styles.typeGrid}>
                {propertyTypeOptions.map((option) => {
                  const isSelected = selectedTypes.includes(option.value)
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                      onPress={() => togglePropertyType(option.value)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.typeIcon, { backgroundColor: isSelected ? option.color : "#f3f4f6" }]}>
                        <Ionicons name={option.icon as any} size={24} color={isSelected ? "#ffffff" : "#6b7280"} />
                      </View>
                      <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>{option.label}</Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={20} color={option.color} />
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Khoảng giá</Text>

              {/* Custom Price Toggle */}
              <View style={styles.customPriceToggle}>
                <Text style={styles.toggleLabel}>Tùy chỉnh khoảng giá</Text>
                <Switch
                  value={useCustomPrice}
                  onValueChange={setUseCustomPrice}
                  trackColor={{ false: "#e5e7eb", true: "#bfdbfe" }}
                  thumbColor={useCustomPrice ? "#2563eb" : "#f3f4f6"}
                />
              </View>

              {useCustomPrice ? (
                /* Custom Price Inputs */
                <View style={styles.customPriceContainer}>
                  <View style={styles.priceInputGroup}>
                    <Text style={styles.inputLabel}>Giá từ</Text>
                    <View style={styles.priceInputContainer}>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                        value={customMinPrice}
                        onChangeText={handleMinPriceChange}
                        keyboardType="numeric"
                      />
                      <Text style={styles.currency}>VNĐ</Text>
                    </View>
                  </View>

                  <View style={styles.priceInputGroup}>
                    <Text style={styles.inputLabel}>Giá đến</Text>
                    <View style={styles.priceInputContainer}>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Không giới hạn"
                        placeholderTextColor="#9ca3af"
                        value={customMaxPrice}
                        onChangeText={handleMaxPriceChange}
                        keyboardType="numeric"
                      />
                      <Text style={styles.currency}>VNĐ</Text>
                    </View>
                  </View>
                </View>
              ) : (
                /* Predefined Price Ranges */
                <View style={styles.priceRangeContainer}>
                  {priceRangeOptions.map((option) => {
                    const isSelected = selectedPriceRange === option.value
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.priceRangeOption, isSelected && styles.priceRangeOptionSelected]}
                        onPress={() => setSelectedPriceRange(option.value)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                          {isSelected && <View style={styles.radioButtonInner} />}
                        </View>
                        <Text style={[styles.priceRangeLabel, isSelected && styles.priceRangeLabelSelected]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={20} color="#6b7280" />
              <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
              <Ionicons name="checkmark-outline" size={20} color="#ffffff" />
              <Text style={styles.applyButtonText}>
                Áp dụng {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeOption: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeOptionSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
  },
  typeLabelSelected: {
    color: "#1f2937",
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  customPriceToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  customPriceContainer: {
    gap: 16,
  },
  priceInputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    paddingVertical: 0,
  },
  currency: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginLeft: 8,
  },
  priceRangeContainer: {
    gap: 8,
  },
  priceRangeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  priceRangeOptionSelected: {
    backgroundColor: "#eff6ff",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: "#2563eb",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },
  priceRangeLabel: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  priceRangeLabelSelected: {
    color: "#1f2937",
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  applyButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    gap: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
})
