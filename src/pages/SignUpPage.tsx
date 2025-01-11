import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/LanguageSelector";
import { Eye, EyeOff } from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (page: 'home' | 'login' | 'signup') => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  occupation: string;
}

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

const SignUpPage = ({ onNavigate }: SignUpPageProps) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    occupation: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preferenceInput, setPreferenceInput] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (error) setError(null);
    
    if (name === 'password') {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setError(passwordError);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        occupation: formData.occupation || undefined,
        preferences: preferences.length > 0 ? preferences : undefined
      });
      onNavigate('home');
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        if (errorMessage.includes('user_already_exists') || errorMessage.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Failed to sign up. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          {t.auth.signup}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.auth.firstName} <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t.auth.firstName}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.auth.lastName} <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t.auth.lastName}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.auth.email} <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t.auth.email}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.auth.password} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.auth.password}
                  className="mt-1 p-3 pr-12 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.auth.confirmPassword} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t.auth.confirmPassword}
                  className="mt-1 p-3 pr-12 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t.auth.occupation}
              </label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t.profile.notSpecified}</option>
                <option value="lawyer">Lawyer</option>
                <option value="student">Law Student</option>
                <option value="educator">Law Educator</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              {t.auth.preferences}
            </label>
            <div className="flex mt-2">
              <input
                type="text"
                value={preferenceInput}
                onChange={(e) => setPreferenceInput(e.target.value)}
                placeholder="e.g., Human Rights, Pharmacy"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  if (preferenceInput && preferences.length < 5) {
                    setPreferences([...preferences, preferenceInput]);
                    setPreferenceInput("");
                  }
                }}
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {preferences.map((pref, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-200 px-4 py-2 rounded-md"
                >
                  <span>{pref}</span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() =>
                      setPreferences(preferences.filter((_, i) => i !== idx))
                    }
                  >
                    {t.profile.cancel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              {t.profile.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-md ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? t.profile.updating : t.auth.signup}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;