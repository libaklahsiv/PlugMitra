import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Zap,
  Compass,
  Plus,
  LayoutDashboard,
  User
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isExplore = location.pathname.startsWith('/explore');
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isProfile = location.pathname.startsWith('/profile');

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation"
    >
      <div className="relative flex items-center justify-around h-16 px-2">
        {/* Home */}
        <NavLink
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHome ? 'text-forest-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className={`w-5 h-5 ${isHome ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-semibold mt-1">Home</span>
        </NavLink>

        {/* Explore */}
        <NavLink
          to="/explore"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isExplore ? 'text-forest-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className={`w-5 h-5 ${isExplore ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-semibold mt-1">Explore</span>
        </NavLink>

        {/* Floating Add Charger Action */}
        <div className="flex-1 flex justify-center -mt-6">
          <Link
            to="/add-charger"
            className="w-13 h-13 rounded-full bg-forest-800 hover:bg-forest-900 active:bg-forest-950 text-white flex flex-col items-center justify-center shadow-lg shadow-forest-900/30 border-4 border-white transition-transform active:scale-95"
            aria-label="Add Charger"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </Link>
        </div>

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isDashboard ? 'text-forest-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${isDashboard ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-semibold mt-1">Dashboard</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isProfile ? 'text-forest-800' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className={`w-5 h-5 ${isProfile ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] font-semibold mt-1">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
