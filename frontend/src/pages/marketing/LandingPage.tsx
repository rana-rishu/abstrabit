import React from 'react';
import { FloatingNavbar } from '../../components/marketing/sections/FloatingNavbar';
import { AbstrabitHero } from '../../components/marketing/sections/AbstrabitHero';
import { LogoDescriptionSection } from '../../components/marketing/sections/LogoDescriptionSection';
import { ProjectFlowCanvas } from '../../components/marketing/sections/ProjectFlowCanvas';
import { NewsletterSection } from '../../components/marketing/sections/NewsletterSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <FloatingNavbar />
      <AbstrabitHero />
      <LogoDescriptionSection />
      <ProjectFlowCanvas />
      <NewsletterSection />
    </div>
  );
};
