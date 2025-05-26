import type React from "react"
import { TouchableOpacity, Text, StyleSheet, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface FloatingActionButtonProps {
  onPress: () => void
  title?: string
  icon?: string
  loading?: boolean
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  title = "Thêm bài đăng",
  icon = "add",
  loading = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.fab, loading && styles.fabDisabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <View style={styles.fabContent}>
        <Ionicons name={icon as any} size={24} color="#ffffff" />
        <Text style={styles.fabText}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2563eb",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  fabDisabled: {
    backgroundColor: "#9ca3af",
    elevation: 4,
    shadowOpacity: 0.1,
  },
  fabContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  fabText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})