import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Compass, PlusCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Plug<span className="text-brand-400">Mitra</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Chennai’s homegrown community EV charging & parking network. We connect residential hosts, apartment complexes, and businesses with EV owners seeking reliable, neighborhood charging.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Headquartered in Chennai, Tamil Nadu, India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brand-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-brand-400 transition flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-brand-500" />
                  <span>Explore Chennai Map</span>
                </Link>
              </li>
              <li>
                <Link to="/add-charger" className="hover:text-brand-400 transition flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-brand-500" />
                  <span>Add Your Charger</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Chennai Hubs */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Key Chennai Corridors
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
              {['OMR IT Corridor', 'Anna Nagar', 'Adyar', 'T. Nagar', 'Velachery', 'Besant Nagar', 'Guindy', 'Tambaram'].map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-1 rounded-lg bg-navy-900 border border-navy-800 text-slate-300"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PlugMitra. Built for Chennai's clean mobility revolution.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Chennai Map (Leaflet / OpenStreetMap)</span>
            <span>•</span>
            <span>Community Driven</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
