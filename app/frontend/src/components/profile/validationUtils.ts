import type { FormValidation } from '../../types';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export const validateField = (
  name: string, 
  value: string, 
  rules: ValidationRules
): { isValid: boolean; message: string } => {
  const rule = rules[name];
  if (!rule) return { isValid: true, message: '' };

  if (rule.required && !value.trim()) {
    return { isValid: false, message: `${name.charAt(0).toUpperCase() + name.slice(1)} is required` };
  }

  if (rule.minLength && value.length < rule.minLength) {
    return { isValid: false, message: `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rule.minLength} characters` };
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return { isValid: false, message: `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than ${rule.maxLength} characters` };
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return { isValid: false, message: rule.message };
  }

  return { isValid: true, message: '' };
};

export const validateForm = (
  formData: Record<string, any>, 
  rules: ValidationRules
): { isValid: boolean; validation: FormValidation } => {
  const validation: FormValidation = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    if (typeof value === 'string') {
      const result = validateField(field, value, rules);
      validation[field] = result;
      if (!result.isValid) isValid = false;
    }
  });

  return { isValid, validation };
};

export const validateUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username) && username.length >= 3 && username.length <= 20;
};

// Password validation functions
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  // Additional complexity
  if (password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 2;
  }
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const validateImageFile = (file: File): { isValid: boolean; message: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' };
  }

  if (file.size > maxSize) {
    return { isValid: false, message: 'Image file size must be less than 5MB' };
  }

  return { isValid: true, message: '' };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 