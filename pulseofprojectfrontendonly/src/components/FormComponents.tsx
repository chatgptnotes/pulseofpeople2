import React, { useState, useEffect } from 'react';
import { Eye as EyeIcon, EyeOff as EyeOffIcon, AlertCircle as AlertIcon, CheckCircle as SuccessIcon } from 'lucide-react';
import { ValidationRule, validateField, getFieldClassName, sanitizeInput } from '../lib/form-validation';

interface BaseInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  helpText?: string;
  showValidation?: boolean;
}

/**
 * Text Input with Validation
 */
export function ValidatedInput({
  label,
  error,
  touched,
  required,
  helpText,
  showValidation = true,
  className = '',
  ...props
}: BaseInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const baseClass = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
  const fieldClass = getFieldClassName(baseClass, error, touched);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          className={`${fieldClass} ${className}`}
          {...props}
        />
        {showValidation && touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertIcon className="w-5 h-5 text-red-500" />
            ) : (
              <SuccessIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <AlertIcon className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Password Input with Toggle Visibility
 */
export function PasswordInput({
  label,
  error,
  touched,
  required,
  helpText,
  showValidation = true,
  className = '',
  ...props
}: BaseInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const baseClass = 'w-full px-4 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
  const fieldClass = getFieldClassName(baseClass, error, touched);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`${fieldClass} ${className}`}
          {...props}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {showValidation && touched && (
            <div>
              {error ? (
                <AlertIcon className="w-5 h-5 text-red-500" />
              ) : (
                <SuccessIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <AlertIcon className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Textarea with Validation
 */
export function ValidatedTextarea({
  label,
  error,
  touched,
  required,
  helpText,
  showValidation = true,
  className = '',
  ...props
}: BaseInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const baseClass = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none';
  const fieldClass = getFieldClassName(baseClass, error, touched);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          className={`${fieldClass} ${className}`}
          {...props}
        />
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <AlertIcon className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Select Dropdown with Validation
 */
export function ValidatedSelect({
  label,
  error,
  touched,
  required,
  helpText,
  showValidation = true,
  children,
  className = '',
  ...props
}: BaseInputProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const baseClass = 'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
  const fieldClass = getFieldClassName(baseClass, error, touched);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`${fieldClass} ${className}`}
          {...props}
        >
          {children}
        </select>
        {showValidation && touched && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertIcon className="w-5 h-5 text-red-500" />
            ) : (
              <SuccessIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <AlertIcon className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Checkbox with Validation
 */
export function ValidatedCheckbox({
  label,
  error,
  touched,
  required,
  helpText,
  className = '',
  ...props
}: BaseInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="mb-4">
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
          {...props}
        />
        {label && (
          <span className="ml-2 text-sm text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
      </label>
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1 ml-6">{helpText}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 ml-6 flex items-center">
          <AlertIcon className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Radio Group with Validation
 */
export function ValidatedRadioGroup({
  label,
  error,
  touched,
  required,
  helpText,
  options,
  name,
  value,
  onChange,
}: BaseInputProps & {
  options: { value: string; label: string }[];
  name: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <AlertIcon className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * File Input with Validation
 */
export function ValidatedFileInput({
  label,
  error,
  touched,
  required,
  helpText,
  accept,
  onChange,
  ...props
}: BaseInputProps & {
  accept?: string;
  onChange?: (files: FileList | null) => void;
}) {
  const [fileName, setFileName] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileName(files && files.length > 0 ? files[0].name : '');
    onChange?.(files);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          id="file-upload"
          {...props}
        />
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {fileName || 'Click to upload or drag and drop'}
            </p>
            {accept && (
              <p className="text-xs text-gray-400 mt-1">
                Accepted: {accept}
              </p>
            )}
          </div>
        </label>
      </div>
      {helpText && !error && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
      {error && touched && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <AlertIcon className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Form Submit Button
 */
export function SubmitButton({
  loading,
  disabled,
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default {
  ValidatedInput,
  PasswordInput,
  ValidatedTextarea,
  ValidatedSelect,
  ValidatedCheckbox,
  ValidatedRadioGroup,
  ValidatedFileInput,
  SubmitButton,
};
