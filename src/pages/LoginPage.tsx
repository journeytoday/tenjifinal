import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import GoogleIcon from "../components/icons/GoogleIcon";
import LanguageSelector from "../components/LanguageSelector";
import { Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: 'home' | 'login' | 'signup') => void;
}

const LoginPage = ({ onNavigate }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInAsGuest } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      onNavigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    }
  };

  const handleGuestAccess = async () => {
    try {
      await signInAsGuest();
      onNavigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to continue as guest');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-gray-100 shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          {t.auth.login}
        </h2>

        <button 
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:bg-gray-50 mb-6"
        >
          <span>{t.auth.signInWithGoogle}</span>
          <GoogleIcon />
        </button>

        <div className="flex items-center mb-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">{t.auth.orContinueWith}</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.email}
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.password}
              className="w-full p-3 pr-12 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="text-right mb-4">
            <button 
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => {/* Handle forgot password */}}
            >
              {t.auth.forgotPassword}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-900 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? t.profile.updating : t.auth.login}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          {t.auth.notAMember}{" "}
          <button 
            onClick={() => onNavigate('signup')}
            className="text-blue-600 hover:underline"
          >
            {t.auth.signup}
          </button>
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          <button 
            onClick={handleGuestAccess}
            className="text-blue-600 hover:underline"
          >
            {t.auth.useAsGuest}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;