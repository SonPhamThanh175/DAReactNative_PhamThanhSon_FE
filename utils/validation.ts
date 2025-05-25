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