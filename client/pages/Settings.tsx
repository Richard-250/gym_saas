import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { Settings, Bell, Shield, User } from 'lucide-react';

export const Setting: React.FC = () => {
  const { currentGym } = useAuth();

  return (
    <LayoutWithSidebar>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-6 w-6 text-lime-500" />
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
            <p className="text-lg font-bold text-white">{currentGym?.name}</p>
            <p className="text-sm text-white/70">Manage your gym settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    <User className="h-4 w-4 mr-2" />
                    General
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">General Settings</CardTitle>
                <CardDescription className="text-white/70">
                  Basic information about your gym
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gym-name" className="text-white">Gym Name</Label>
                  <Input 
                    id="gym-name" 
                    defaultValue={currentGym?.name} 
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gym-email" className="text-white">Email</Label>
                  <Input 
                    id="gym-email" 
                    type="email" 
                    placeholder="contact@gym.com"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gym-phone" className="text-white">Phone</Label>
                  <Input 
                    id="gym-phone" 
                    placeholder="+1 (555) 123-4567"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/80">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Notification Settings</CardTitle>
                <CardDescription className="text-white/70">
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-white">Email Notifications</Label>
                    <p className="text-sm text-white/70">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications" className="text-white">SMS Notifications</Label>
                    <p className="text-sm text-white/70">Receive notifications via SMS</p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="text-white">Push Notifications</Label>
                    <p className="text-sm text-white/70">Receive push notifications</p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
};