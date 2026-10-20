import React, { useState } from 'react';
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
  Info
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
    isConfigured
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

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
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => closeAuthModal(), 800);
      }
    } else {
      if (password.length < 6) {
        setIsSubmitting(false);
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      const { error } = await signUp(email, password, fullName, phone);
      setIsSubmitting(false);
      if (error) {
        setErrorMsg(error.message || 'Failed to create account.');
      } else {
        setSuccessMsg('Account created successfully! Welcome to PlugMitra.');
        setTimeout(() => closeAuthModal(), 900);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {authModalMode === 'login' ? 'Sign in to PlugMitra' : 'Join PlugMitra Chennai'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {authModalMode === 'login'
                  ? 'Access your saved spots and host dashboard'
                  : 'Host chargers or book neighborhood parking slots'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend Status Notice */}
        <div className="px-5 pt-3">
          {isConfigured ? (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Connected to live Supabase Auth</span>
            </div>
          ) : (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Offline Simulation:</strong> Add <code>VITE_SUPABASE_URL</code> to <code>.env.local</code> for production Auth.
              </span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password *
            </label>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : authModalMode === 'login' ? (
              <span>Sign In</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600">
          {authModalMode === 'login' ? (
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
          ) : (
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
        </div>
      </div>
    </div>
  );
};
