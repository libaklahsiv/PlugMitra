import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Zap,
  Compass,
  PlusCircle,
  LayoutDashboard,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, openAuthModal } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: Zap },
    { name: 'Explore Chargers', path: '/explore', icon: Compass },
    { name: 'Add Charger', path: '/add-charger', icon: PlusCircle },
    { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 rounded-xl"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-sm group-hover:bg-forest-900 transition-colors">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-display">
                  Plug<span className="text-forest-700">Mitra</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-50 text-forest-800 px-1.5 py-0.5 rounded border border-forest-200">
                  Chennai
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">
                Community EV Charging Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
                    isActive
                      ? 'bg-forest-50 text-forest-900 border border-forest-200/90 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-forest-700' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-forest-300 bg-slate-50 hover:bg-forest-50/50 transition text-xs font-semibold text-slate-800"
                  title="View your profile"
                >
                  <div className="w-5 h-5 rounded-full bg-forest-800 text-white text-[10px] flex items-center justify-center font-bold">
                    {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="truncate max-w-[110px]">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white font-semibold text-xs shadow-xs transition"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Top Bar (Quick link to Profile/Menu) */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/profile"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${
                  isActive
                    ? 'bg-forest-50 text-forest-900 border border-forest-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-forest-700' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
              >
                <span>Sign Out ({profile?.full_name || user.email})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-forest-900 bg-forest-50 border border-forest-200 flex items-center justify-center gap-2"
              >
                <span>Sign In to PlugMitra</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
