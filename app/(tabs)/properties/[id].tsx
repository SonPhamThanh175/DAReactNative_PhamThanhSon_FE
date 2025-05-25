import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, Link } from 'expo-router';
import { propertiesService } from '../../../services/properties.service';
import { Property } from '../../../types/Property';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await propertiesService.getPropertyById(id as string);
          setProperty(data);
        } catch (err: any) {
          setError(err.message || 'Không thể tải chi tiết tài sản.');
          console.error('Failed to fetch property details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang tải chi tiết tài sản...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy tài sản.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: property.name }} />
      <Text style={styles.name}>{property.name}</Text>
      <Text style={styles.price}>Giá: {property.price.toLocaleString()} VNĐ</Text>
      <Text style={styles.address}>Địa chỉ: {property.address}</Text>
      <Text style={styles.description}>{property.description}</Text>
      <Text style={styles.owner}>Người đăng: {property.userId?.name || 'N/A'}</Text>
      <Text style={styles.ownerPhone}>Điện thoại: {property.userId?.phone || 'N/A'}</Text>
      <Text style={styles.date}>Ngày tạo: {new Date(property.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.date}>Cập nhật: {new Date(property.updatedAt).toLocaleDateString()}</Text>

      <View style={styles.actions}>
        <Link href={`/(tabs)/properties/${property._id}/edit`} asChild>
          <TouchableOpacity style={{}}>
            <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
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
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  price: {
    fontSize: 20,
    color: '#007bff',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 15,
  },
  owner: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  ownerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
});