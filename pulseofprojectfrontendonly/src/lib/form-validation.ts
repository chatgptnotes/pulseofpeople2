/**
 * Form Validation Library
 * Comprehensive validation rules and utilities
 */

export type ValidationRule = {
  validate: (value: any, formData?: Record<string, any>) => boolean;
  message: string;
};

export type FieldValidation = {
  value: any;
  rules: ValidationRule[];
  touched?: boolean;
  error?: string;
};

export type FormValidation = Record<string, FieldValidation>;

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    },
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Optional field
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      // Indian phone number format: +91XXXXXXXXXX or XXXXXXXXXX
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      return phoneRegex.test(value.replace(/\s+/g, ''));
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Minimum ${min} characters required`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Maximum ${max} characters allowed`,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= min;
    },
    message: message || `Minimum value is ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= max;
    },
    message: message || `Maximum value is ${max}`,
  }),

  pattern: (pattern: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return pattern.test(value);
    },
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  alphanumeric: (message = 'Only letters and numbers allowed'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return /^[a-zA-Z0-9]+$/.test(value);
    },
    message,
  }),

  numeric: (message = 'Only numbers allowed'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return /^\d+$/.test(value);
    },
    message,
  }),

  alphabetic: (message = 'Only letters allowed'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return /^[a-zA-Z\s]+$/.test(value);
    },
    message,
  }),

  password: (message = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return (
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value)
      );
    },
    message,
  }),

  strongPassword: (
    message = 'Password must be at least 12 characters with uppercase, lowercase, number, and special character'
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return (
        value.length >= 12 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(value)
      );
    },
    message,
  }),

  match: (fieldName: string, message?: string): ValidationRule => ({
    validate: (value, formData) => {
      if (!value || !formData) return true;
      return value === formData[fieldName];
    },
    message: message || `Must match ${fieldName}`,
  }),

  date: (message = 'Please enter a valid date'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message,
  }),

  futureDate: (message = 'Date must be in the future'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date();
    },
    message,
  }),

  pastDate: (message = 'Date must be in the past'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date < new Date();
    },
    message,
  }),

  age: (minAge: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= minAge;
      }
      return age >= minAge;
    },
    message: message || `Must be at least ${minAge} years old`,
  }),

  custom: (
    validateFn: (value: any, formData?: Record<string, any>) => boolean,
    message: string
  ): ValidationRule => ({
    validate: validateFn,
    message,
  }),
};

/**
 * Validate a single field
 */
export function validateField(
  value: any,
  rules: ValidationRule[],
  formData?: Record<string, any>
): string | null {
  for (const rule of rules) {
    if (!rule.validate(value, formData)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate entire form
 */
export function validateForm(
  formValidation: FormValidation
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const formData: Record<string, any> = {};

  // Build form data object
  Object.entries(formValidation).forEach(([field, validation]) => {
    formData[field] = validation.value;
  });

  // Validate each field
  Object.entries(formValidation).forEach(([field, validation]) => {
    const error = validateField(validation.value, validation.rules, formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize input value
 */
export function sanitizeInput(value: string, type: 'text' | 'email' | 'phone' | 'number' = 'text'): string {
  // Remove leading/trailing whitespace
  let sanitized = value.trim();

  switch (type) {
    case 'email':
      sanitized = sanitized.toLowerCase();
      break;
    case 'phone':
      sanitized = sanitized.replace(/[^\d+]/g, '');
      break;
    case 'number':
      sanitized = sanitized.replace(/[^\d.-]/g, '');
      break;
    case 'text':
    default:
      // Remove any HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      break;
  }

  return sanitized;
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: string | null): string | null {
  if (!error) return null;
  return error.charAt(0).toUpperCase() + error.slice(1);
}

/**
 * Get field class based on validation state
 */
export function getFieldClassName(
  baseClass: string,
  error?: string | null,
  touched?: boolean
): string {
  if (!touched) return baseClass;

  if (error) {
    return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
  }

  return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500`;
}

/**
 * Debounce validation for better UX
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Form validation hook helper
 */
export interface UseFormValidationOptions {
  initialValues: Record<string, any>;
  validationRules: Record<string, ValidationRule[]>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
}

export class FormValidator {
  private values: Record<string, any>;
  private errors: Record<string, string> = {};
  private touched: Record<string, boolean> = {};
  private validationRules: Record<string, ValidationRule[]>;

  constructor(initialValues: Record<string, any>, validationRules: Record<string, ValidationRule[]>) {
    this.values = { ...initialValues };
    this.validationRules = validationRules;
  }

  setValue(field: string, value: any): void {
    this.values[field] = value;
    this.validateField(field);
  }

  setTouched(field: string): void {
    this.touched[field] = true;
  }

  validateField(field: string): boolean {
    const rules = this.validationRules[field] || [];
    const error = validateField(this.values[field], rules, this.values);

    if (error) {
      this.errors[field] = error;
      return false;
    } else {
      delete this.errors[field];
      return true;
    }
  }

  validateAll(): boolean {
    const validation: FormValidation = {};

    Object.keys(this.validationRules).forEach(field => {
      validation[field] = {
        value: this.values[field],
        rules: this.validationRules[field],
        touched: true,
      };
    });

    const result = validateForm(validation);
    this.errors = result.errors;

    // Mark all fields as touched
    Object.keys(this.validationRules).forEach(field => {
      this.touched[field] = true;
    });

    return result.isValid;
  }

  getError(field: string): string | undefined {
    return this.touched[field] ? this.errors[field] : undefined;
  }

  getErrors(): Record<string, string> {
    return { ...this.errors };
  }

  getValues(): Record<string, any> {
    return { ...this.values };
  }

  reset(): void {
    this.errors = {};
    this.touched = {};
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }
}

export default {
  ValidationRules,
  validateField,
  validateForm,
  sanitizeInput,
  formatValidationError,
  getFieldClassName,
  debounce,
  FormValidator,
};
