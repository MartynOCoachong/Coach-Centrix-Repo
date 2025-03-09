import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Phone, User, UserCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

interface EditableProfile extends Profile {
  password: string;
  confirmPassword: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableProfile, setEditableProfile] = useState<EditableProfile>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          setProfile(data);
          setEditableProfile({
            ...data,
            password: '',
            confirmPassword: ''
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: editableProfile.first_name,
          last_name: editableProfile.last_name,
          email: editableProfile.email,
          phone: editableProfile.phone,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update password if provided
      if (editableProfile.password) {
        if (editableProfile.password !== editableProfile.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: editableProfile.password
        });

        if (passwordError) throw passwordError;
      }

      // Update email if changed
      if (editableProfile.email !== profile?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editableProfile.email
        });

        if (emailError) throw emailError;
      }

      setProfile(editableProfile);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const renderField = (label: string, name: string, type: string = 'text', icon?: React.ReactNode) => {
    if (editMode) {
      return (
        <div>
          <label className="block text-sm text-zinc-400 mb-1">{label}</label>
          <input
            type={type}
            name={name}
            value={editableProfile[name as keyof EditableProfile]}
            onChange={handleInputChange}
            className="w-full bg-zinc-800 rounded-lg p-3 text-white border border-zinc-700 focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm text-zinc-400 mb-1">{label}</label>
        <div className="bg-zinc-800 rounded-lg p-3 flex items-center gap-2">
          {icon}
          {profile?.[name as keyof Profile]}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header profile={profile} />

      <div className="p-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-zinc-400">Manage your account settings</p>
        </div>

        {/* Profile Information */}
        <div className="max-w-2xl mx-auto space-y-6 pb-32">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-white text-3xl font-semibold">
                {profile?.first_name?.charAt(0) || '?'}
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Personal Information
              </h2>
              <div className="space-y-4">
                {renderField('First Name', 'first_name')}
                {renderField('Last Name', 'last_name')}
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail size={20} className="text-primary" />
                Contact Information
              </h2>
              <div className="space-y-4">
                {renderField('Email', 'email', 'email')}
                {renderField('Phone', 'phone', 'tel', <Phone size={16} className="text-zinc-400" />)}
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserCircle size={20} className="text-primary" />
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Role</label>
                  <div className="bg-zinc-800 rounded-lg p-3 capitalize">
                    {profile?.role || 'member'}
                  </div>
                </div>
                {editMode ? (
                  <>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editableProfile.password}
                        onChange={handleInputChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full bg-zinc-800 rounded-lg p-3 text-white border border-zinc-700 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={editableProfile?.confirmPassword || ""}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        className="w-full bg-zinc-800 rounded-lg p-3 text-white border border-zinc-700 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Password</label>
                    <button className="w-full bg-zinc-800 rounded-lg p-3 text-left flex items-center justify-between hover:bg-zinc-700 transition-colors">
                      <span>••••••••</span>
                      <Lock size={16} className="text-zinc-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditableProfile({
                      ...profile!,
                      password: '',
                      confirmPassword: ''
                    });
                    setError(null);
                  }}
                  className="flex-1 bg-zinc-800 text-white font-semibold py-4 px-6 rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}