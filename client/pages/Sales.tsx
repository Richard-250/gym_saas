import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { FileText, TrendingUp, Users, DollarSign } from 'lucide-react';

export const Sales: React.FC = () => {
  const { currentGym } = useAuth();

  const salesData = [
    { id: 1, plan: 'Basic Membership', price: '$49/month', sold: 45, revenue: '$2,205' },
    { id: 2, plan: 'Premium Membership', price: '$79/month', sold: 23, revenue: '$1,817' },
    { id: 3, plan: 'Personal Training', price: '$99/session', sold: 67, revenue: '$6,633' },
  ];

  return (
    <LayoutWithSidebar>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-6 w-6 text-lime-500" />
              <h1 className="text-2xl font-bold text-white">Sales</h1>
            </div>
            <p className="text-lg font-bold text-white">{currentGym?.name}</p>
            <p className="text-sm text-white/70">Track sales and revenue</p>
          </div>
        </div>

        {/* Sales Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">$10,655</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Memberships Sold</p>
                  <p className="text-2xl font-bold text-white">135</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">24%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Performance */}
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Sales Performance</CardTitle>
            <CardDescription className="text-white/70">
              Overview of membership sales and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{sale.plan}</p>
                    <p className="text-sm text-white/70">{sale.price}</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-white/70">Sold</p>
                      <p className="font-medium text-white">{sale.sold}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/70">Revenue</p>
                      <p className="font-medium text-white">{sale.revenue}</p>
                    </div>
                    <Badge variant="default">
                      Active
                    </Badge>
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