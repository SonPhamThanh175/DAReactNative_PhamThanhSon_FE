import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PropertyType = 'apartment' | 'house' | 'villa' | 'land';

interface PropertyTypeOption {
  value: PropertyType;
  label: string;
  icon: string;
  description: string;
}

const propertyTypeOptions: PropertyTypeOption[] = [
  {
    value: 'apartment',
    label: 'Chung cư',
    icon: 'business-outline',
    description: 'Căn hộ trong tòa nhà cao tầng'
  },
  {
    value: 'house',
    label: 'Nhà phố',
    icon: 'home-outline',
    description: 'Nhà riêng lẻ, nhà phố thường'
  },
  {
    value: 'villa',
    label: 'Biệt thự',
    icon: 'library-outline',
    description: 'Villa, biệt thự cao cấp'
  },
  {
    value: 'land',
    label: 'Đất nền',
    icon: 'map-outline',
    description: 'Đất trống, đất nền dự án'
  }
];

interface PropertyTypeSelectorProps {
  value: PropertyType | null;
  onSelect: (type: PropertyType) => void;
  placeholder?: string;
}

export const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  value,
  onSelect,
  placeholder = "Chọn loại tài sản"
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = propertyTypeOptions.find(option => option.value === value);

  const handleSelect = (type: PropertyType) => {
    onSelect(type);
    setModalVisible(false);
  };

  const renderOption = ({ item }: { item: PropertyTypeOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        value === item.value && styles.optionItemSelected
      ]}
      onPress={() => handleSelect(item.value)}
      activeOpacity={0.7}
    >
      <View style={styles.optionLeft}>
        <View style={[
          styles.optionIcon,
          value === item.value && styles.optionIconSelected
        ]}>
          <Ionicons 
            name={item.icon as any} 
            size={24} 
            color={value === item.value ? "#ffffff" : "#6b7280"} 
          />
        </View>
        <View style={styles.optionText}>
          <Text style={[
            styles.optionLabel,
            value === item.value && styles.optionLabelSelected
          ]}>
            {item.label}
          </Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
        </View>
      </View>
      {value === item.value && (
        <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Ionicons 
            name={selectedOption?.icon as any || "apps-outline"} 
            size={20} 
            color="#6b7280" 
            style={styles.selectorIcon} 
          />
          <Text style={[
            styles.selectorText,
            !selectedOption && styles.selectorPlaceholder
          ]}>
            {selectedOption?.label || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn loại tài sản</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={propertyTypeOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorIcon: {
    marginRight: 12,
  },
  selectorText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  selectorPlaceholder: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  optionItemSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconSelected: {
    backgroundColor: '#2563eb',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#2563eb',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
