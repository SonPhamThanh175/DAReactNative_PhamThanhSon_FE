import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { propertiesService } from '../../../services/properties.service';
import { router } from 'expo-router';

export default function CreatePropertyScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProperty = async () => {
    if (!name || !description || !price || !address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc (Tên, Mô tả, Giá, Địa chỉ).');
      return;
    }

    setLoading(true);
    try {
      const newProperty = await propertiesService.createProperty({
        name,
        description,
        price: parseFloat(price),
        address,
        imageUrl: imageUrl || undefined, // fixed this line
      });
      Alert.alert('Thành công', 'Tài sản đã được tạo thành công!');
      router.replace(`/(tabs)/properties/${newProperty._id}`);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể tạo tài sản.'); // fixed this line
      console.error('Create property failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo tài sản mới</Text>
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
        title={loading ? "Đang tạo..." : "Tạo tài sản"}
        onPress={handleCreateProperty}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.activityIndicator} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
