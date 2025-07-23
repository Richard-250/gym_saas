import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Dumbbell,
  Heart,
  Calendar,
  Bell,
  Settings,
  Users,
  DollarSign,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  X,
  CreditCard,
  FileText,
  UserPlus,
  LogIn,
  Menu,
  Monitor
} from 'lucide-react';
import { generateSampleDashboardStats, generateSampleMembers, generateSampleTasks, generateSamplePayments, generateSampleNotifications } from '@/lib/sample-data';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, currentGym, logout, setCurrentGym, userGyms } = useAuth();
  const [notifications, setNotifications] = useState(generateSampleNotifications('user-1', currentGym?.id || 'gym-1'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const stats = generateSampleDashboardStats();
  const members = generateSampleMembers(currentGym?.id || 'gym-1');
  const tasks = generateSampleTasks(currentGym?.id || 'gym-1');
  const payments = generateSamplePayments(currentGym?.id || 'gym-1');

  const navigationItems = [
    { icon: Calendar, label: 'Calendar', active: false },
    { icon: Users, label: 'Members', active: true },
    { icon: Activity, label: 'Activity', active: false },
    { icon: DollarSign, label: 'Payments', active: false },
    { icon: Dumbbell, label: 'Equipment', active: false },
    { icon: FileText, label: 'Reports', active: false },
    { icon: Bell, label: 'Notifications', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  if (!currentGym) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Gym Selected</h1>
          <p className="text-muted-foreground mb-4">Please select a gym to view the dashboard.</p>
          <Button asChild>
            <Link to="/gyms">Select Gym</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-foreground hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col py-4 transition-all duration-300 z-40 ${
        isMobileMenuOpen ? 'w-64' : 'w-64 lg:w-64 -translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="flex items-center space-x-3 px-4 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">GymSaaS</span>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col space-y-2 px-3 flex-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-12 px-3 ${
                  item.active ? 'bg-sidebar-accent' : ''
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* User Avatar */}
        <div className="px-4 mt-auto">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64 p-6 text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <Badge variant="outline" className="text-warning border-warning bg-warning/10">
                {currentGym.subscription.planType}
              </Badge>
            </div>
            <p className="text-lg text-white">{currentGym.name}</p>
            <p className="text-sm text-white/70">payments this month</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link to="/gyms">Switch Gym</Link>
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={logout}>Sign Out</Button>
          </div>
        </div>

        {/* Trial Warning */}
        {currentGym.subscription.planType === 'trial' && (
          <div className="bg-warning/20 border border-warning rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="text-warning font-medium">
                  You are currently on the free plan. Please upgrade your account to fully use our software
                </span>
              </div>
              <Button className="bg-warning text-warning-foreground hover:bg-warning/90">
                UPGRADE
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Circular Progress Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-2">
                      <Progress value={66.7} className="h-2 bg-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">66.7%</span>
                      </div>
                    </div>
                    <p className="text-xs text-center text-white/70">Scheduled</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-2">
                      <Progress value={88.2} className="h-2 bg-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">88.2%</span>
                      </div>
                    </div>
                    <p className="text-xs text-center text-white/70">Paid</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-2">
                      <Progress value={75.0} className="h-2 bg-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">75.0%</span>
                      </div>
                    </div>
                    <p className="text-xs text-center text-white/70">Overdue</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-2">
                      <Progress value={35.0} className="h-2 bg-white/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">35.0%</span>
                      </div>
                    </div>
                    <p className="text-xs text-center text-white/70">Attendance</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs text-white/70">Total Members</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary">+{stats.memberGrowth}% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-xs text-white/70">Monthly Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary">+{stats.revenueGrowth}% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-xs text-white/70">Active Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.activeSessions}</p>
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary">+{stats.sessionGrowth}% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs text-white/70">Equipment Usage</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.equipmentUsage}%</p>
                  <div className="flex items-center space-x-1 text-xs">
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">{stats.usageGrowth}% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Attendance Chart */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  <span>Attendances</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/20">Last 7 Days</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <Bar
                      dataKey="count"
                      fill="rgba(255,255,255,0.2)"
                      radius={[4, 4, 0, 0]}
                      onMouseEnter={(data, index) => {
                        // Custom tooltip will be handled by recharts
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </CardTitle>
                  {notifications.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={dismissAllNotifications}
                    >
                      DISMISS ALL
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-white/70 text-center py-4">No new notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="flex items-start space-x-3 p-3 bg-white/10 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-xs text-white/70 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5" />
                  <span>My Bookings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="font-medium text-white">1:30PM</p>
                    <p className="text-white/70">JL 1/1</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-white">Schedule Today</h4>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span className="text-sm text-white">6:00PM</span>
                        </div>
                        <Badge className="bg-primary text-primary-foreground">CHECK-IN</Badge>
                      </div>
                      <p className="text-sm text-white/70 mt-1">Senior Ciri-on<br />Tony second</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-white">Upcoming</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <p className="font-medium text-white">7:00PM Starting</p>
                        <p className="text-white/70">Senior Sensi</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-white">9:00PM Judo - AUL move</p>
                        <p className="text-white/70">VH 1</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm font-medium text-white">Total Sessions Today: 4</p>
                    <div className="flex items-center space-x-4 text-xs mt-1">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>In Progress</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                        <span>Upcoming</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                    <UserPlus className="h-6 w-6" />
                    <span className="text-xs">Add Member</span>
                  </Button>
                  <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                    <LogIn className="h-6 w-6" />
                    <span className="text-xs">Check In</span>
                  </Button>
                  <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                    <CreditCard className="h-6 w-6" />
                    <span className="text-xs">New Payment</span>
                  </Button>
                  <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80">
                    <FileText className="h-6 w-6" />
                    <span className="text-xs">View Reports</span>
                  </Button>
                  <Button className="h-20 flex flex-col space-y-2 bg-primary hover:bg-primary/80 col-span-2">
                    <Monitor className="h-6 w-6" />
                    <span className="text-xs">Front End Mode</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Payments */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span>Overdue payments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center space-x-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">CR</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">CYRUANIRO Richard</p>
                        <p className="text-xs text-white/70">{payment.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-destructive">${payment.amount}</p>
                        <p className="text-xs text-destructive">13/04/2025</p>
                      </div>
                      <Button variant="outline" size="icon" className="h-6 w-6 border-white/20 hover:bg-white/10">
                        <FileText className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Tasks */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>My tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-white">{task.title}</span>
                        <span className="text-xs text-destructive ml-auto">Due Jun 17, 12:00pm</span>
                      </div>
                      <p className="text-xs text-white/70 pl-6">
                        Visitor: Niyomugabo Fidela
                      </p>
                      <p className="text-xs text-white/70 pl-6">
                        Note<br />
                        {task.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
