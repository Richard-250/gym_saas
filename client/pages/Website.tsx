import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { Globe, Eye, Settings, Palette } from 'lucide-react';

export const Website: React.FC = () => {
  const { currentGym } = useAuth();

  return (
    <LayoutWithSidebar>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="h-6 w-6 text-lime-500" />
              <h1 className="text-2xl font-bold text-white">Website</h1>
            </div>
            <p className="text-lg font-bold text-white">{currentGym?.name}</p>
            <p className="text-sm text-white/70">Manage your gym website</p>
          </div>
        </div>

        {/* Website Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Website Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Domain</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">SSL Certificate</span>
                  <Badge variant="default">Valid</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Last Updated</span>
                  <span className="text-white">2 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-primary hover:bg-primary/80">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Website
                </Button>
                <Button className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                  <Palette className="h-4 w-4 mr-2" />
                  Customize Theme
                </Button>
                <Button className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                  <Settings className="h-4 w-4 mr-2" />
                  Website Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Website Analytics */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Website Analytics</CardTitle>
            <CardDescription className="text-white/70">
              Track your website performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <p className="text-2xl font-bold text-white">1.2K</p>
                <p className="text-sm text-white/70">Visitors</p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <p className="text-2xl font-bold text-white">3.4K</p>
                <p className="text-sm text-white/70">Page Views</p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <p className="text-2xl font-bold text-white">2.1</p>
                <p className="text-sm text-white/70">Avg. Duration</p>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <p className="text-2xl font-bold text-white">45%</p>
                <p className="text-sm text-white/70">Bounce Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  );
};