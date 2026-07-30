import React from 'react';
import { Link } from 'react-router-dom';

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-black text-white border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white tracking-tight">Abstrabit</span>
          <span>© {new Date().getFullYear()} Abstrabit Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="hover:text-white transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </footer>
  );
};
