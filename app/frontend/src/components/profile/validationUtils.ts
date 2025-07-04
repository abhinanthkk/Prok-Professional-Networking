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