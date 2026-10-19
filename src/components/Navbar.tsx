import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Zap, PlusCircle, Menu, X, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: Zap },
    { name: 'Explore Chargers', path: '/explore', icon: Compass },
    { name: 'Add Your Charger', path: '/add-charger', icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy-950 font-display">
                  Plug<span className="text-brand-600">Mitra</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded-md">
                  Chennai
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">
                Community EV Charging Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-2xs border border-brand-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/add-charger"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host a Charger</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/add-charger"
              className="inline-flex items-center justify-center p-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `w-full px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-3 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-brand-600" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
