import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Logo from "../components/Logo";
import PreferencesManager from "../components/profile/PreferencesManager";
import DeleteAccountDialog from "../components/dialogs/DeleteAccountDialog";
import PasswordChangeDialog from "../components/dialogs/PasswordChangeDialog";
import SaveChangesDialog from "../components/dialogs/SaveChangesDialog";
import DataSharingDialog from "../components/dialogs/DataSharingDialog";
import EditableProfileField from "../components/profile/EditableProfileField";
import SuccessMessage from "../components/profile/SuccessMessage";
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  onNavigate: (page: 'home' | 'login' | 'signup' | 'profile') => void;
}

interface EditableFields {
  firstName: string;
  lastName: string;
  email: string;
  occupation: string;
}

interface PasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = ({ onNavigate }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'privacy'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChangeConfirm, setShowPasswordChangeConfirm] = useState(false);
  const [showSaveChangesConfirm, setShowSaveChangesConfirm] = useState(false);
  const [showDataSharingConfirm, setShowDataSharingConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  const [editableFields, setEditableFields] = useState<EditableFields>({
    firstName: '',
    lastName: '',
    email: '',
    occupation: ''
  });

  const [initialFields, setInitialFields] = useState<EditableFields>({
    firstName: '',
    lastName: '',
    email: '',
    occupation: ''
  });

  const [passwordFields, setPasswordFields] = useState<PasswordFields>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    user, 
    updatePassword, 
    deleteAccount,
    addPreference,
    removePreference 
  } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useLanguage();

  useEffect(() => {
    if (user) {
      const fields = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        occupation: user.occupation || ''
      };
      setEditableFields(fields);
      setInitialFields(fields);
    }
  }, [user]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600">{t.auth.login}</p>
      </div>
    );
  }

  const handleDataSharingToggle = async () => {
    if (dataSharing) {
      setShowDataSharingConfirm(true);
    } else {
      setDataSharing(true);
    }
  };

  const handleConfirmDataSharingOff = async () => {
    try {
      // Delete preferences
      await supabase
        .from('profiles')
        .update({ preferences: [] })
        .eq('id', user.id);

      // Delete search history
      await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id);

      setDataSharing(false);
      setShowDataSharingConfirm(false);
      setShowSuccessMessage('Data sharing preferences updated');
    } catch (error) {
      console.error('Error updating data sharing preferences:', error);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain a number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain a special character";
    return null;
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    
    if (!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (passwordFields.currentPassword === passwordFields.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    const passwordError = validatePassword(passwordFields.newPassword);
    if (passwordError) {
      setPasswordError(passwordError);
      return;
    }

    setShowPasswordChangeConfirm(true);
  };

  const confirmPasswordChange = async () => {
    setIsLoading(true);
    try {
      await updatePassword(passwordFields.currentPassword, passwordFields.newPassword);
      setPasswordFields({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChangeConfirm(false);
      setShowSuccessMessage(t.profile.passwordUpdateSuccess);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      onNavigate('home');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setInitialFields(editableFields);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableFields(initialFields);
  };

  const handleSaveChanges = () => {
    setShowSaveChangesConfirm(true);
  };

  const confirmSaveChanges = async () => {
    setShowSaveChangesConfirm(false);
    setIsEditing(false);
    setShowSuccessMessage("Profile updated successfully");
  };

  const renderProfile = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.profile.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-md shadow-md">
        <EditableProfileField
          label={t.auth.firstName}
          value={editableFields.firstName}
          isEditing={isEditing}
          onEdit={handleEditClick}
          onCancel={handleCancelEdit}
          onChange={(value) => setEditableFields(prev => ({ ...prev, firstName: value }))}
        />
        <EditableProfileField
          label={t.auth.lastName}
          value={editableFields.lastName}
          isEditing={isEditing}
          onEdit={handleEditClick}
          onCancel={handleCancelEdit}
          onChange={(value) => setEditableFields(prev => ({ ...prev, lastName: value }))}
        />
        <EditableProfileField
          label={t.auth.email}
          value={editableFields.email}
          isEditing={isEditing}
          onEdit={handleEditClick}
          onCancel={handleCancelEdit}
          onChange={(value) => setEditableFields(prev => ({ ...prev, email: value }))}
          editable={false}
        />
        <EditableProfileField
          label={t.auth.occupation}
          value={editableFields.occupation}
          isEditing={isEditing}
          onEdit={handleEditClick}
          onCancel={handleCancelEdit}
          onChange={(value) => setEditableFields(prev => ({ ...prev, occupation: value }))}
          type="select"
          options={[
            { value: 'lawyer', label: 'Lawyer' },
            { value: 'student', label: 'Law Student' },
            { value: 'educator', label: 'Law Educator' },
            { value: 'other', label: 'Other' }
          ]}
        />

        {isEditing && (
          <div className="col-span-2 flex justify-end space-x-4">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
            >
              {t.profile.cancel}
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? t.profile.updating : t.profile.saveChanges}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white p-6 rounded-md shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t.auth.preferences}</h3>
        <PreferencesManager
          preferences={user.preferences || []}
          onAddPreference={addPreference}
          onRemovePreference={removePreference}
          isDisabled={!dataSharing}
        />
      </div>
    </div>
  );

  const renderPasswordManagement = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.profile.passwordManagement}</h2>
      <div className="bg-white p-6 rounded-md shadow-md">
        <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.profile.currentPassword}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordFields.currentPassword}
                onChange={(e) => setPasswordFields(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.profile.newPassword}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordFields.newPassword}
                onChange={(e) => setPasswordFields(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.profile.confirmNewPassword}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordFields.confirmPassword}
                onChange={(e) => setPasswordFields(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? t.profile.updating : t.profile.updatePassword}
          </button>
        </form>
      </div>
    </div>
  );

  const renderDataPrivacy = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.profile.dataPrivacy}</h2>
      <div className="bg-white p-6 rounded-md shadow-md space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">{t.profile.privacySettings}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">{t.profile.dataSharing}</h4>
                <p className="text-sm text-gray-500">{t.profile.dataSharingDesc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataSharing}
                  onChange={handleDataSharingToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.profile.deleteAccount}</h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {t.profile.deleteAccount}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-white shadow-lg p-6">
        <div className="flex justify-center mb-8">
          <Logo onNavigate={onNavigate} />
        </div>
        <ul className="space-y-4">
          <li 
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile' 
                ? 'bg-gray-800 text-white' 
                : 'hover:bg-gray-200'
            } py-2 px-4 rounded-md text-center cursor-pointer transition-colors`}
          >
            {t.profile.title}
          </li>
          <li 
            onClick={() => setActiveTab('password')}
            className={`${
              activeTab === 'password' 
                ? 'bg-gray-800 text-white' 
                : 'hover:bg-gray-200'
            } py-2 px-4 rounded-md text-center cursor-pointer transition-colors`}
          >
            {t.profile.passwordManagement}
          </li>
          <li 
            onClick={() => setActiveTab('privacy')}
            className={`${
              activeTab === 'privacy' 
                ? 'bg-gray-800 text-white' 
                : 'hover:bg-gray-200'
            } py-2 px-4 rounded-md text-center cursor-pointer transition-colors`}
          >
            {t.profile.dataPrivacy}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-200 p-6">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <select 
            value={currentLanguage.code}
            onChange={(e) => {
              const lang = languages.find(l => l.code === e.target.value);
              if (lang) setLanguage(lang);
            }}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.code}
              </option>
            ))}
          </select>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'password' && renderPasswordManagement()}
        {activeTab === 'privacy' && renderDataPrivacy()}
      </div>

      {/* Dialogs */}
      {showDeleteConfirm && (
        <DeleteAccountDialog
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {showPasswordChangeConfirm && (
        <PasswordChangeDialog
          onCancel={() => setShowPasswordChangeConfirm(false)}
          onConfirm={confirmPasswordChange}
        />
      )}

      {showSaveChangesConfirm && (
        <SaveChangesDialog
          onCancel={() => setShowSaveChangesConfirm(false)}
          onConfirm={confirmSaveChanges}
        />
      )}

      {showDataSharingConfirm && (
        <DataSharingDialog
          onCancel={() => setShowDataSharingConfirm(false)}
          onConfirm={handleConfirmDataSharingOff}
        />
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <SuccessMessage message={showSuccessMessage} />
      )}
    </div>
  );
};

export default ProfilePage;