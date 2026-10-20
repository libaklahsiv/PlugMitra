import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Compass, PlusCircle, LayoutDashboard, User } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-16 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-xs">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Plug<span className="text-forest-400">Mitra</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Chennai’s community-driven EV charging & parking platform. We connect residential hosts and businesses with EV owners seeking reliable neighborhood charging.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-forest-400 shrink-0" />
              <span>Headquartered in Chennai, Tamil Nadu, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-forest-400 transition flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-forest-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-forest-400 transition flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-forest-500" />
                  <span>Explore Chennai Map</span>
                </Link>
              </li>
              <li>
                <Link to="/add-charger" className="hover:text-forest-400 transition flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5 text-forest-500" />
                  <span>Add Your Charger</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-forest-400 transition flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-forest-500" />
                  <span>My Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-forest-400 transition flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-forest-500" />
                  <span>Driver Profile</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Chennai Hubs */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-3">
              Chennai Coverage Hubs
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
              {['OMR IT Corridor', 'Anna Nagar', 'Adyar', 'T. Nagar', 'Velachery', 'Besant Nagar', 'Guindy', 'Tambaram'].map((area) => (
                <span
                  key={area}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} PlugMitra. Built for Chennai's clean mobility revolution.</p>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Leaflet & OpenStreetMap</span>
            <span>•</span>
            <span>Community EV Infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
