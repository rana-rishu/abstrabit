import React from 'react';
import { Outlet } from 'react-router-dom';
import { FooterSection } from '../components/marketing/sections/FooterSection';

export const MarketingLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between relative overflow-x-hidden selection:bg-white selection:text-black">
      <main className="flex-1 w-full relative z-10">
        <Outlet />
      </main>
      <FooterSection />
    </div>
  );
};
