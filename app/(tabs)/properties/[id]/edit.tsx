import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { propertiesService } from '../../../../services/properties.service';
import { Property } from '../../../../types/Property';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await propertiesService.getPropertyById(id as string);
          setProperty(data);
          setName(data.name);
          setDescription(data.description);
          setPrice(data.price.toString());
          setAddress(data.address);
          setImageUrl(data.imageUrl || '');
        } catch (err: any) {
          setError(err.message || 'Không thể tải chi tiết tài sản để chỉnh sửa.');
          console.error('Failed to fetch property for edit:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id]);

  const handleUpdateProperty = async () => {
    if (!name || !description || !price || !address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (Tên, Mô tả, Giá, Địa chỉ).');
      return;
    }

    setSaving(true);
    try {
      await propertiesService.updateProperty(id as string, {
        name,
        description,
        price: parseFloat(price),
        address,
        imageUrl: imageUrl || undefined,
      });
      Alert.alert('Thành công', 'Tài sản đã được cập nhật thành công!');
      router.back();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật tài sản.');
      console.error('Update property failed:', error);
    } finally {
      setSaving(false);
    }
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
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không tìm thấy tài sản để chỉnh sửa.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: `Chỉnh sửa: ${property.name}` }} />
      <Text style={styles.title}>Chỉnh sửa tài sản</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên tài sản"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Giá (VNĐ)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="URL hình ảnh (Tùy chọn)"
        value={imageUrl}
        onChangeText={setImageUrl}
        keyboardType="url"
        autoCapitalize="none"
      />
      <Button
        title={saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        onPress={handleUpdateProperty}
        disabled={saving}
      />
      {saving && <ActivityIndicator size="small" color="#0000ff" style={styles.activityIndicator} />}
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  activityIndicator: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
