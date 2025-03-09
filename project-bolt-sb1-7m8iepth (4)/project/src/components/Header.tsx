import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, UserPlus, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  profile: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    role_id?: string;
  } | null;
}

export default function Header({ profile }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [associationName, setAssociationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteLink(null);

    try {
      // Create association
      const { data: association, error: associationError } = await supabase
        .from('associations')
        .insert([
          { name: associationName, email: inviteEmail, status: 'pending' }
        ])
        .select()
        .single();

      if (associationError) throw associationError;

      // Create invitation
      const token = crypto.randomUUID();
      const { data: invitation, error: invitationError } = await supabase
        .from('association_invitations')
        .insert([
          {
            association_id: association.id,
            email: inviteEmail,
            token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          }
        ])
        .select()
        .single();

      if (invitationError) throw invitationError;

      // Generate invite link
      const inviteUrl = `${window.location.origin}/invite?token=${token}`;
      setInviteLink(inviteUrl);

      // Trigger the Edge Function to send the invitation email
      const { error: functionError } = await supabase.functions.invoke('send-invitation', {
        body: { invitationId: invitation.id }
      });

      if (functionError) {
        console.error('Failed to send invitation email:', functionError);
        // Don't throw here - we still want to show the invite link even if email fails
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check if user has admin role by role_id
  const isAdmin = Boolean(profile?.role_id && profile.role_id === import.meta.env.VITE_ADMIN_ROLE_ID);

  return (
    <div className="flex justify-between items-center mb-4 px-6">
      <Link to="/dashboard" className="flex items-center gap-2">
        <img 
          src="https://i.ibb.co/M5kryBJ2/C-ACH-Photoroom.png"
          alt="Coach Centrix"
          className="w-auto h-24 sm:h-28 md:h-32"
        />
      </Link>

      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-6 text-zinc-500">
          <Link to="/session" className="hover:text-primary transition-colors">Session</Link>
          <Link to="/drills" className="hover:text-primary transition-colors">Drills</Link>
          <Link to="/season" className="hover:text-primary transition-colors">Season</Link>
          <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Invite Association
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </nav>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            <span className="text-white text-lg font-semibold">
              {profile?.first_name?.charAt(0) || '?'}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-800 rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-white">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-zinc-400">{profile?.email}</p>
                <p className="text-xs text-zinc-400">{profile?.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Invite Association</h2>
            
            {!inviteLink ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Association Name</label>
                  <input
                    type="text"
                    value={associationName}
                    onChange={(e) => setAssociationName(e.target.value)}
                    className="w-full bg-zinc-800 rounded-lg p-3 text-white border border-zinc-700 focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-zinc-800 rounded-lg p-3 text-white border border-zinc-700 focus:border-primary focus:outline-none transition-colors"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary"
                  >
                    {loading ? 'Creating...' : 'Create Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 bg-zinc-800 text-white font-semibold py-4 px-6 rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-sm font-medium text-zinc-300">Invitation Link</span>
                    <button
                      onClick={copyToClipboard}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400 break-all">{inviteLink}</p>
                </div>

                <div className="bg-primary/10 text-primary rounded-lg p-4 text-sm">
                  Share this link with the association. The link will expire in 7 days.
                </div>

                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full btn-primary"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}