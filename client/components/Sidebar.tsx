import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  Users,
  CreditCard as BillingIcon,
  TrendingUp as MarketingIcon,
  Globe,
  FileText,
  Dumbbell,
  Settings,
  Building2,
  HelpCircle,
  Menu,
  Heart,
  User
} from 'lucide-react';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileMenuOpen = false, 
  setIsMobileMenuOpen = () => {} 
}) => {
  const { user, currentGym, logout } = useAuth();
  const location = useLocation();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowAccountMenu(false);
    if (showAccountMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAccountMenu]);

  const navigationItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Members', path: '/members' },
    { icon: BillingIcon, label: 'Billing', path: '/billing' },
    { icon: MarketingIcon, label: 'Marketing', path: '/marketing' },
    { icon: Globe, label: 'Website', path: '/website' },
    { icon: FileText, label: 'Sales', path: '/sales' },
    { icon: Dumbbell, label: 'My Gyms', path: '/gyms' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Building2, label: 'Front Desk', path: '/front-desk' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-foreground hover:bg-white/10"
        >
          <Menu className="h-6 w-6 text-yellow-400" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col py-4 z-40 w-[85px] lg:w-[85px] transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-center px-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex flex-col space-y-1 px-2 flex-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link 
                to={item.path} 
                key={index} 
                className="w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={`w-full flex flex-col items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent h-16 px-1 group ${
                    active ? 'bg-sidebar-accent' : ''
                  } ${isMobileMenuOpen ? 'h-12 flex-row justify-start px-3' : ''}`}
                >
                  <Icon className={`h-5 w-5 ${isMobileMenuOpen ? 'mr-3 text-yellow-400' : 'mb-1'} ${
                    !isMobileMenuOpen && active ? 'text-primary' : 'text-sidebar-foreground'
                  }`} />
                  <span className={`text-xs ${
                    isMobileMenuOpen ? 'text-sm text-yellow-400' : 'text-sidebar-foreground/80'
                  } group-hover:text-sidebar-foreground ${active ? 'text-sidebar-foreground' : ''}`}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
        
        {/* Account Button - only show on mobile menu */}
        {isMobileMenuOpen && (
          <div className="px-2 mt-auto">
            <div className="relative">
              <Button
                variant="ghost"
                className="w-full h-12 flex-row justify-start px-3 text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <User className="h-5 w-5 mr-3 text-yellow-400" />
                <span className="text-sm text-yellow-400">Account</span>
              </Button>

              {showAccountMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-background border border-white/20 rounded-lg shadow-lg z-50">
                  <div className="p-2 space-y-1">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" asChild>
                      <Link to="/gyms">Switch Gym</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                      Account Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={logout}>
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};