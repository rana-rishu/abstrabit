import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const FloatingNavbar: React.FC = () => {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      {/* Apple Glass Frosted Container */}
      <div className="pointer-events-auto bg-white/[0.07] backdrop-blur-2xl border border-white/20 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] max-w-4xl w-full transition-all">
        {/* Brand Logo */}
        <Link to="/" className="group">
          <span className="font-bold text-sm tracking-tight text-white group-hover:text-zinc-300 transition-colors">
            Abstrabit
          </span>
        </Link>

        {/* Right CTAs */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-medium text-zinc-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-md group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
};
