export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // Password must be at least 6 characters long
  return password.length >= 6;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Simple check for 10-11 digits
  const phoneRegex = /^\d{10,11}$/;
  return phoneRegex.test(phone);
};

export const formatPrice = (price: number): string => {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} tỷ`
  } else if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} triệu`
  } else {
    return `${price.toLocaleString("vi-VN")} VNĐ`
  }
}

export const getPropertyTypeLabel = (type: string): string => {
  const typeLabels: { [key: string]: string } = {
    apartment: "Chung cư",
    house: "Nhà phố",
    villa: "Biệt thự",
    land: "Đất nền",
  }
  return typeLabels[type] || type
}
