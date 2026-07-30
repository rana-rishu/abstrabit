import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-app text-txt-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-card border border-border-subtle rounded-lg p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded bg-accent-primary flex items-center justify-center font-bold text-accent-dark text-lg">
            A
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
