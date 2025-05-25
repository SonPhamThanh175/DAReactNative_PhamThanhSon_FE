"use client"

import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface User {
  email: string
  id: string
  name: string
  phone: string
}

export const useAsyncStorage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user")
      console.log("Retrieved user data:", userData);
      
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error getting user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveUserData = async (userData: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem("user")
      setUser(null)
    } catch (error) {
      console.error("Error clearing user data:", error)
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  return {
    user,
    loading,
    saveUserData,
    clearUserData,
    refreshUserData: getUserData,
  }
}
