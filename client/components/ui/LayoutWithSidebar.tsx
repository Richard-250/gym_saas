import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';

interface LayoutWithSidebarProps {
  children: React.ReactNode;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="lg:ml-[85px] p-6 text-foreground">
        {children}
      </div>
    </div>
  );
};
