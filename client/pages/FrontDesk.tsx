import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import { Building2, Users, Clock, CheckCircle } from 'lucide-react';

export const FrontDesk: React.FC = () => {
  const { currentGym } = useAuth();

  const checkIns = [
    { id: 1, name: 'John Doe', time: '9:30 AM', status: 'Checked In' },
    { id: 2, name: 'Jane Smith', time: '10:15 AM', status: 'Checked In' },
    { id: 3, name: 'Mike Johnson', time: '11:00 AM', status: 'Checked In' },
  ];

  const appointments = [
    { id: 1, name: 'Personal Training', client: 'Sarah Wilson', time: '2:00 PM' },
    { id: 2, name: 'Fitness Assessment', client: 'Tom Brown', time: '3:30 PM' },
    { id: 3, name: 'Nutrition Consult', client: 'Emily Davis', time: '4:15 PM' },
  ];

  return (
    <LayoutWithSidebar>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="h-6 w-6 text-lime-500" />
              <h1 className="text-2xl font-bold text-white">Front Desk</h1>
            </div>
            <p className="text-lg font-bold text-white">{currentGym?.name}</p>
            <p className="text-sm text-white/70">Manage daily operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-ins */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Users className="h-5 w-5" />
                <span>Today's Check-ins</span>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  {checkIns.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checkIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{checkIn.name}</p>
                      <p className="text-sm text-white/70">{checkIn.time}</p>
                    </div>
                    <Badge variant="default" className="bg-green-500/20 text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {checkIn.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Clock className="h-5 w-5" />
                <span>Upcoming Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white">{appointment.name}</p>
                      <Badge variant="outline" className="border-white/20 text-white">
                        {appointment.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/70">Client: {appointment.client}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/10 border-white/20 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                <Users className="h-6 w-6" />
                <span className="text-xs">Check In</span>
              </Button>
              <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                <CheckCircle className="h-6 w-6" />
                <span className="text-xs">New Member</span>
              </Button>
              <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                <Clock className="h-6 w-6" />
                <span className="text-xs">Schedule</span>
              </Button>
              <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                <Building2 className="h-6 w-6" />
                <span className="text-xs">Tours</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  );
};