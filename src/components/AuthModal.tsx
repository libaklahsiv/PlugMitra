import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Info,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithDemoAccount,
    resetPassword,
    updatePassword,
    isConfigured,
    oauthError,
    clearOAuthError,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync OAuth errors if returned from redirect
  useEffect(() => {
    if (oauthError) {
      setErrorMsg(oauthError);
    }
  }, [oauthError]);

  // Reset form messages when switching modal modes
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    clearOAuthError();
    setErrorMsg(null);
    setSuccessMsg(null);
    closeAuthModal();
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleSubmitting(true);
    const { error } = await signInWithGoogle();
    setIsGoogleSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Google sign-in could not be completed. Please try again.');
    } else {
      // In local offline mode:
      if (!isConfigured) {
        setSuccessMsg('Signed in with Google test session!');
        setTimeout(() => handleClose(), 700);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (authModalMode === 'login') {
      const { error } = await signIn(email, password);
      setIsSubmitting(false);
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in. Please verify your email and password.');
      } else {
        setSuccessMsg('Signed in successfully! Welcome back.');
        setTimeout(() => handleClose(), 800);
      }
    } else if (authModalMode === 'signup') {
      if (password.length < 6) {
        setIsSubmitting(false);
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setIsSubmitting(false);
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      const { error, confirmationRequired } = await signUp(email, password, fullName, phone);
      setIsSubmitting(false);
      if (error) {
        setErrorMsg(error.message || 'Failed to create account.');
      } else if (confirmationRequired) {
        setSuccessMsg(
          'Account created! We have sent a confirmation email to ' +
            email +
            '. Please click the verification link in your inbox to complete activation.'
        );
      } else {
        setSuccessMsg('Account created successfully! Welcome to PlugMitra Chennai.');
        setTimeout(() => handleClose(), 900);
      }
    } else if (authModalMode === 'forgot') {
      if (!email.trim()) {
        setIsSubmitting(false);
        setErrorMsg('Please enter your email address.');
        return;
      }
      const { error } = await resetPassword(email.trim());
      setIsSubmitting(false);
      if (error) {
        setErrorMsg(error.message || 'Failed to send password recovery email.');
      } else {
        setSuccessMsg('Password reset link sent! Check your inbox for instructions to set a new password.');
      }
    } else if (authModalMode === 'reset-password') {
      if (password.length < 6) {
        setIsSubmitting(false);
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setIsSubmitting(false);
        setErrorMsg('Passwords do not match.');
        return;
      }
      const { error } = await updatePassword(password);
      setIsSubmitting(false);
      if (error) {
        setErrorMsg(error.message || 'Failed to update password.');
      } else {
        setSuccessMsg('Your password has been updated! You are now logged in.');
        setTimeout(() => handleClose(), 1200);
      }
    }
  };

  const getTitle = () => {
    switch (authModalMode) {
      case 'login':
        return 'Sign in to PlugMitra';
      case 'signup':
        return 'Join PlugMitra Chennai';
      case 'forgot':
        return 'Reset Password';
      case 'reset-password':
        return 'Set New Password';
    }
  };

  const getSubtitle = () => {
    switch (authModalMode) {
      case 'login':
        return 'Access your saved spots, bookings, and host dashboard';
      case 'signup':
        return 'Host neighborhood chargers or reserve community parking bays';
      case 'forgot':
        return 'Enter your email to receive a secure password recovery link';
      case 'reset-password':
        return 'Enter your new password to regain access to your account';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-xs">
              {authModalMode === 'reset-password' ? (
                <KeyRound className="w-5 h-5 text-white" />
              ) : (
                <Zap className="w-5 h-5 fill-white text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {getTitle()}
              </h3>
              <p className="text-[11px] text-slate-500">
                {getSubtitle()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend Status Notice & Sandbox Persona Switcher */}
        <div className="px-5 pt-3 space-y-2">
          {isConfigured ? (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Live Supabase Authentication Active</span>
                <p className="text-[10px] text-emerald-700">Multi-tenant accounts, Google OAuth, and RLS enforced.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-[11px] text-amber-950 space-y-2">
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Local Development Sandbox</span>
                  <p className="text-[10px] text-amber-800 leading-tight">
                    Supabase keys not yet in <code>.env.local</code>. You can test multi-account workflows using the presets below or create accounts with email.
                  </p>
                </div>
              </div>

              {/* Quick Persona Switcher for local testing */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block mb-1.5">
                  Test Personas (Click to Instant Login):
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await signInWithDemoAccount('driver');
                      handleClose();
                    }}
                    className="p-1.5 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-xl text-center transition flex flex-col items-center gap-0.5"
                    title="Sign in as EV Driver (Vishal)"
                  >
                    <span className="text-xs">🚗</span>
                    <span className="text-[10px] font-bold text-slate-800 leading-none">EV Driver</span>
                    <span className="text-[9px] text-slate-500 leading-none">User</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await signInWithDemoAccount('host');
                      handleClose();
                    }}
                    className="p-1.5 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-xl text-center transition flex flex-col items-center gap-0.5"
                    title="Sign in as Residential Host (Suresh)"
                  >
                    <span className="text-xs">🏠</span>
                    <span className="text-[10px] font-bold text-slate-800 leading-none">Bay Host</span>
                    <span className="text-[9px] text-slate-500 leading-none">Host</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await signInWithDemoAccount('admin');
                      handleClose();
                    }}
                    className="p-1.5 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-xl text-center transition flex flex-col items-center gap-0.5"
                    title="Sign in as Platform Admin"
                  >
                    <span className="text-xs">🛡️</span>
                    <span className="text-[10px] font-bold text-slate-800 leading-none">Admin</span>
                    <span className="text-[9px] text-slate-500 leading-none">Admin Role</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Google OAuth Option (for Login & Signup modes) */}
        {(authModalMode === 'login' || authModalMode === 'signup') && (
          <div className="px-5 pt-3 space-y-3">
            <button
              type="button"
              disabled={isGoogleSubmitting || isSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                or with email
              </span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vishal Kabilan"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number (WhatsApp enabled)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email input (for login, signup, and forgot password) */}
          {authModalMode !== 'reset-password' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          )}

          {/* Password input (for login, signup, and reset-password) */}
          {authModalMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {authModalMode === 'reset-password' ? 'New Password *' : 'Password *'}
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] font-semibold text-forest-800 hover:text-forest-950 underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          )}

          {/* Password Confirmation (for signup and reset-password) */}
          {(authModalMode === 'signup' || authModalMode === 'reset-password') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : authModalMode === 'login' ? (
              <span>Sign In</span>
            ) : authModalMode === 'signup' ? (
              <span>Create Account</span>
            ) : authModalMode === 'forgot' ? (
              <span>Send Password Reset Link</span>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

        {/* Footer Toggles */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600">
          {authModalMode === 'login' && (
            <p>
              New to PlugMitra?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="font-bold text-forest-800 hover:text-forest-950 underline"
              >
                Create an account
              </button>
            </p>
          )}

          {authModalMode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="font-bold text-forest-800 hover:text-forest-950 underline"
              >
                Sign in
              </button>
            </p>
          )}

          {(authModalMode === 'forgot' || authModalMode === 'reset-password') && (
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
