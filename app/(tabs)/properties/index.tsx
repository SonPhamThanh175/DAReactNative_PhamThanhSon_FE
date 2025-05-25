import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { propertiesService } from '../../../services/properties.service';
import { Property } from '../../../types/Property';
import { Link, useFocusEffect } from 'expo-router';

export default function PropertiesListScreen() {
  const [properties, setProperties] = useState<Property[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const fetchProperties = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await propertiesService.getPropertiesByUser();
    console.log('Fetched user properties:', data);
    setProperties(Array.isArray(data) ? data : []);
  } catch (err: any) {
    setError(err.message || 'Không thể tải danh sách tài sản.');
    console.error('Failed to fetch properties:', err);
  } finally {
    setLoading(false);
  }
};



  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tài sản này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertiesService.deleteProperty(id);
              fetchProperties();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa tài sản. Vui lòng thử lại sau.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang tải tài sản...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchProperties} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/(tabs)/properties/create" asChild>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Tạo tài sản mới</Text>
        </TouchableOpacity>
      </Link>
      {properties.length === 0 ? (
        <Text style={styles.noPropertiesText}>Chưa có tài sản nào.</Text>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.propertyCard}>
              <Link href={`/(tabs)/properties/${item._id}`} asChild>
                <TouchableOpacity style={styles.propertyInfo}>
                  <Text style={styles.propertyName}>{item.name}</Text>
                  <Text style={styles.propertyPrice}>Giá: {item.price.toLocaleString()} VNĐ</Text>
                  <Text style={styles.propertyAddress}>{item.address}</Text>
                  <Text style={styles.propertyOwner}>Người đăng: {item.userId?.name || 'N/A'}</Text>
                </TouchableOpacity>
              </Link>
              <View style={styles.actions}>
                <Link href={`/(tabs)/properties/${item._id}/edit`} asChild>
                  <TouchableOpacity>
                    <Text style={styles.actionButtonText}>Sửa</Text>
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Text style={styles.actionButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noPropertiesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  propertyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyInfo: {
    marginBottom: 10,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 3,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  propertyOwner: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    marginLeft: 15,
  },
});
