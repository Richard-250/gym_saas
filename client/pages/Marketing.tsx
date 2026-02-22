import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { TrendingUp, Mail, MessageCircle, Users } from 'lucide-react';

export const Marketing: React.FC = () => {
  const { currentGym } = useAuth();

  const campaigns = [
    { id: 1, name: 'New Year Promotion', status: 'Active', reach: '1,234', conversions: '45', type: 'Email' },
    { id: 2, name: 'Summer Special', status: 'Completed', reach: '2,567', conversions: '89', type: 'SMS' },
    { id: 3, name: 'Referral Program', status: 'Active', reach: '3,421', conversions: '123', type: 'Social' },
  ];

  return (
    <LayoutWithSidebar>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-6 w-6 text-lime-500" />
              <h1 className="text-2xl font-bold text-white">Marketing</h1>
            </div>
            <p className="text-lg font-bold text-white">{currentGym?.name}</p>
            <p className="text-sm text-white/70">Grow your gym with marketing campaigns</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Email Campaigns</h3>
              <p className="text-sm text-white/70 mb-4">Send bulk emails to members</p>
              <Button className="w-full">Create Campaign</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">SMS Marketing</h3>
              <p className="text-sm text-white/70 mb-4">Send text messages to members</p>
              <Button className="w-full">Send SMS</Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Referral Program</h3>
              <p className="text-sm text-white/70 mb-4">Track member referrals</p>
              <Button className="w-full">View Program</Button>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded ${
                      campaign.type === 'Email' ? 'bg-blue-500/20' :
                      campaign.type === 'SMS' ? 'bg-green-500/20' : 'bg-purple-500/20'
                    }`}>
                      {campaign.type === 'Email' && <Mail className="h-4 w-4 text-blue-400" />}
                      {campaign.type === 'SMS' && <MessageCircle className="h-4 w-4 text-green-400" />}
                      {campaign.type === 'Social' && <Users className="h-4 w-4 text-purple-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-white/70">Reach: {campaign.reach} • Conversions: {campaign.conversions}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      campaign.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {campaign.status}
                    </span>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      View Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  );
};