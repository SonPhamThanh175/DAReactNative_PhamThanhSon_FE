export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // Password must be at least 6 characters long
  return password.length >= 6;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\d{10,11}$/;
  return phoneRegex.test(phone);
};

export const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) {
    return 'Chưa cập nhật';
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Ngày không hợp lệ';
    }
    return dateObj.toLocaleDateString('vi-VN');
  } catch (error) {
    return 'Ngày không hợp lệ';
  }
};

export const formatArea = (area: number | undefined | null): string => {
  if (area === undefined || area === null || isNaN(area)) {
    return '0';
  }
  return area.toLocaleString('vi-VN');
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
