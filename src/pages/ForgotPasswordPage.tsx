import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ForgotPasswordPageProps {
  onNavigate: (page: 'home' | 'login' | 'signup') => void;
}

const ForgotPasswordPage = ({ onNavigate }: ForgotPasswordPageProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const { resetPassword, verifyEmail } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email !== confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    setIsLoading(true);

    try {
      // First verify the email exists
      const emailExists = await verifyEmail(email);
      if (!emailExists) {
        setError('No account found with this email address');
        return;
      }

      await resetPassword(email);
      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-4">
              We've sent password reset instructions to your email address.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Enter and confirm your email address to receive password reset instructions.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700">
                Confirm Email address
              </label>
              <input
                id="confirmEmail"
                name="confirmEmail"
                type="email"
                required
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your email address"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;