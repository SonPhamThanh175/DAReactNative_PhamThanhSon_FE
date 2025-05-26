import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image,
  ImageSourcePropType 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../../context/AuthContext';
import { router } from 'expo-router';
// import { useSession } from '@/context/AuthContext';

interface SettingsItemProps {
  icon: string;
  title: string;
  onPress?: () => void;
  textStyle?: any;
  showArrow?: boolean;
  iconColor?: string;
}

const SettingsItem = ({ 
  icon, 
  title, 
  onPress, 
  textStyle, 
  showArrow = true,
  iconColor = "#6b7280" 
}: SettingsItemProps) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingsItemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={[styles.settingsText, textStyle]}>{title}</Text>
    </View>
    {showArrow && (
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, signOut } = useSession();
console.log('user', user);

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    router.push('/profile/edit-profile');
  };

  const handleMyProperties = () => {
    Alert.alert('Thông báo', 'Tính năng quản lý tài sản đang được phát triển');
  };

  const handlePayments = () => {
    Alert.alert('Thông báo', 'Tính năng thanh toán đang được phát triển');
  };

  const handleNotifications = () => {
    Alert.alert('Thông báo', 'Tính năng thông báo đang được phát triển');
  };

  const handleSettings = () => {
    Alert.alert('Thông báo', 'Tính năng cài đặt đang được phát triển');
  };

  const handleHelp = () => {
    Alert.alert('Thông báo', 'Tính năng trợ giúp đang được phát triển');
  };

  const handlePrivacy = () => {
    Alert.alert('Thông báo', 'Tính năng bảo mật đang được phát triển');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotifications}
          >
            <Ionicons name="notifications-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.avatar || 'https://via.placeholder.com/150/e5e7eb/6b7280?text=User'
              }}
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#6b7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SettingsItem
            icon="home-outline"
            title="Tài sản của tôi"
            onPress={handleMyProperties}
          />
          <SettingsItem
            icon="card-outline"
            title="Thanh toán"
            onPress={handlePayments}
          />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <SettingsItem
            icon="person-outline"
            title="Chỉnh sửa hồ sơ"
            onPress={handleEditProfile}
          />
          <SettingsItem
            icon="notifications-outline"
            title="Thông báo"
            onPress={handleNotifications}
          />
          <SettingsItem
            icon="settings-outline"
            title="Cài đặt"
            onPress={handleSettings}
          />
          <SettingsItem
            icon="help-circle-outline"
            title="Trợ giúp & Hỗ trợ"
            onPress={handleHelp}
          />
          <SettingsItem
            icon="shield-outline"
            title="Quyền riêng tư"
            onPress={handlePrivacy}
          />
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <SettingsItem
            icon="log-out-outline"
            title="Đăng xuất"
            onPress={handleSignOut}
            showArrow={false}
            textStyle={styles.logoutText}
            iconColor="#ef4444"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  infoRow: {
    paddingVertical: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  logoutSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});