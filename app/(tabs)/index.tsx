import { Text, View, StyleSheet, Button } from 'react-native';
import { useSession } from '../../context/AuthContext';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { signOut, user } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng, {user?.name || 'Người dùng'}!</Text>
      <Text style={styles.subtitle}>Đây là trang chủ của bạn.</Text>

      <Link href="/(tabs)/properties" style={styles.link}>
        <Text style={styles.linkText}>Xem danh sách tài sản</Text>
      </Link>

      <Button title="Đăng xuất" onPress={signOut} color="#dc3545" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  link: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});