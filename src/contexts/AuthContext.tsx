import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  occupation?: string;
  preferences?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (email: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;
  addPreference: (preference: string) => Promise<void>;
  removePreference: (preference: string) => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  occupation?: string;
  preferences?: string[];
}

interface PrivacySettings {
  emailNotifications: boolean;
  dataSharing: boolean;
  activityTracking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
        setIsGuest(false);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, occupation, preferences')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    setUser({
      id: authUser.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      occupation: data.occupation,
      preferences: data.preferences
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signInAsGuest = async () => {
    setIsGuest(true);
    setUser(null);
  };

  const signUp = async (data: SignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          occupation: data.occupation,
          preferences: data.preferences
        }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsGuest(false);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword
    });

    if (verifyError) throw new Error('Current password is incorrect');

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  };

  const verifyEmail = async (email: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }

    return !!data;
  };

  const deleteAccount = async () => {
    if (!user) return;

    const { error: dataError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (dataError) throw dataError;

    const { error: authError } = await supabase.auth.signOut();
    if (authError) throw authError;
  };

  const updatePrivacySettings = async (settings: PrivacySettings) => {
    if (!user) return;

    const { error } = await supabase
      .from('privacy_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  };

  const addPreference = async (preference: string) => {
    if (!user) return;

    const { data: currentData, error: fetchError } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (fetchError) throw fetchError;

    const currentPreferences = currentData.preferences || [];
    if (currentPreferences.length >= 5) {
      throw new Error('Maximum 5 preferences allowed');
    }

    if (currentPreferences.includes(preference)) {
      throw new Error('Preference already exists');
    }

    const newPreferences = [...currentPreferences, preference];

    const { error } = await supabase
      .from('profiles')
      .update({ preferences: newPreferences })
      .eq('id', user.id);

    if (error) throw error;

    setUser(prev => prev ? {
      ...prev,
      preferences: newPreferences
    } : null);
  };

  const removePreference = async (preference: string) => {
    if (!user) return;

    const { data: currentData, error: fetchError } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (fetchError) throw fetchError;

    const newPreferences = (currentData.preferences || []).filter(p => p !== preference);

    const { error } = await supabase
      .from('profiles')
      .update({ preferences: newPreferences })
      .eq('id', user.id);

    if (error) throw error;

    setUser(prev => prev ? {
      ...prev,
      preferences: newPreferences
    } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isGuest,
      signIn,
      signInWithGoogle,
      signInAsGuest,
      signUp,
      signOut,
      updatePassword,
      resetPassword,
      verifyEmail,
      deleteAccount,
      updatePrivacySettings,
      addPreference,
      removePreference
    }}>
      {children}
    </AuthContext.Provider>
  );
};