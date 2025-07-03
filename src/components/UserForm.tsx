import React, { useState } from 'react';
import { Mail, User, Send, Loader2 } from 'lucide-react';
import { UserData } from '../types';

interface UserFormProps {
  onSubmit: (data: UserData) => void;
  isSubmitting: boolean;
  hasLocationSelected: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, isSubmitting, hasLocationSelected }) => {
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<UserData>>({});
  const [touched, setTouched] = useState<Partial<UserData>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Partial<UserData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof UserData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate individual field on blur
    const newErrors = { ...errors };
    
    if (field === 'firstName') {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      } else {
        delete newErrors.firstName;
      }
    }
    
    if (field === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasLocationSelected) {
      alert('Please select your location on the map first');
      return;
    }

    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Mark all fields as touched to show errors
      setTouched({ firstName: true, email: true });
    }
  };

  const isFormValid = !errors.firstName && !errors.email && formData.firstName && formData.email;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* First Name Field */}
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900">
            First Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 text-gray-900 ${
                errors.firstName && touched.firstName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
              placeholder="Enter your first name"
              disabled={isSubmitting}
            />
          </div>
          {errors.firstName && touched.firstName && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs">!</span>
              </span>
              <span>{errors.firstName}</span>
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 text-gray-900 ${
                errors.email && touched.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
              placeholder="Enter your email address"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && touched.email && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs">!</span>
              </span>
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || !hasLocationSelected || isSubmitting}
          className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            !isFormValid || !hasLocationSelected || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span>
            {isSubmitting ? 'Setting up your daily weather updates...' : 'Start My Daily Weather Updates'}
          </span>
        </button>

        {/* Location Warning */}
        {!hasLocationSelected && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm text-center">
              📍 Please select your location on the map above before submitting
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 text-center">
            By submitting this form, you agree to receive daily weather and clothing recommendation emails. 
            You can unsubscribe at any time. We respect your privacy and will never share your information.
          </p>
        </div>
      </form>
    </div>
  );
};

export default UserForm;