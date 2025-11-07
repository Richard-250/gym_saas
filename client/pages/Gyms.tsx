import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Calendar, Users, DollarSign, Settings, Dumbbell, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const Gyms: React.FC = () => {
  const { user, userGyms, setCurrentGym, logout } = useAuth();

  const getSubscriptionBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const statusLabel = (sub: any) => {
    if (!sub) return 'Not Active';
    return sub.status === 'active' ? 'Active' : 'Not Active';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">GymSaaS</h1>
                <p className="text-sm text-white/70">Manage your fitness business</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="border-white/20 text-white hover:bg-white/10">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white">Your Gyms</h2>
          <p className="text-white/70">
            Select a gym to manage or create a new one
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Existing Gyms */}
          {userGyms.map((gym) => (
            <Card key={gym.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white/10 border-white/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={gym.logo} alt={gym.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {gym.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant={getSubscriptionBadgeVariant(gym.subscription.status)}>
                    {statusLabel(gym.subscription)}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="group-hover:text-primary transition-colors text-white">
                    {gym.name}
                  </CardTitle>
                  <p className="text-sm text-white/70 mt-1">
                    {gym.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Subscription Info */}
                  {/* Subscription Info */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-white/70" />
                    <span className="font-medium text-white/70">
                      {statusLabel(gym.subscription)}
                    </span>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <Users className="h-4 w-4 mx-auto mb-1 text-white/70" />
                      <p className="text-xs font-medium text-white">Members</p>
                      <p className="text-sm text-white/70">--</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <DollarSign className="h-4 w-4 mx-auto mb-1 text-white/70" />
                      <p className="text-xs font-medium text-white">Revenue</p>
                      <p className="text-sm text-white/70">--</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 mx-auto mb-1 text-white/70" />
                      <p className="text-xs font-medium text-white">Sessions</p>
                      <p className="text-sm text-white/70">--</p>
                    </div>
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-white/70">
                    Created {formatDistanceToNow(new Date(gym.createdAt), { addSuffix: true })}
                  </p>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/80"
                      onClick={() => {
                        setCurrentGym(gym.id);
                      }}
                      asChild
                    >
                      <Link to="/dashboard">
                        Open Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Gym Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-dashed border-2 hover:border-primary bg-white/5 border-white/20">
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Create New Gym</h3>
              <p className="text-sm text-white/70 text-center mb-4">
                Set up a new gym and start managing your fitness business
              </p>
              <Button asChild className="bg-primary hover:bg-primary/80">
                <Link to="/setup">
                  Get Started
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {userGyms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No gyms yet</h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              Get started by creating your first gym. You'll be able to manage members,
              sessions, payments, and more.
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/80">
              <Link to="/setup">
                Create Your First Gym
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
