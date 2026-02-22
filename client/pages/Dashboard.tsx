import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { LayoutWithSidebar } from '@/components/ui/LayoutWithSidebar';
import {
  Dumbbell,
  Calendar,
  Bell,
  Users,
  DollarSign,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  FileText,
  UserPlus,
  LogIn,
  Monitor,
  Sparkles,
  Search,
  BarChart3,
} from 'lucide-react';
import { generateSampleDashboardStats } from '@/lib/sample-data';
import { gymMemberStorage, gymTaskStorage, gymPaymentStorage, gymNotificationStorage, initializeGymData } from '@/lib/gym-storage';
import { Notification } from '@shared/types';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, currentGym, logout, setCurrentGym, userGyms } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowAccountMenu(false);
    if (showAccountMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAccountMenu]);

  const stats = generateSampleDashboardStats();

  // Initialize gym data if it doesn't exist
  useEffect(() => {
    if (currentGym) {
      initializeGymData(currentGym.id);
    }
  }, [currentGym]);

  // Get gym-specific data
  const members = currentGym ? gymMemberStorage.getAll(currentGym.id) : [];
  const tasks = currentGym ? gymTaskStorage.getAll(currentGym.id) : [];
  const payments = currentGym ? gymPaymentStorage.getAll(currentGym.id) : [];

  // Initialize notifications from gym-specific storage
  useEffect(() => {
    if (currentGym) {
      const gymNotifications = gymNotificationStorage.getAll(currentGym.id);
      setNotifications(gymNotifications);
    }
  }, [currentGym]);

  const dismissNotification = (notificationId: string) => {
    if (currentGym) {
      gymNotificationStorage.markAsRead(currentGym.id, notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const dismissAllNotifications = () => {
    if (currentGym && user) {
      gymNotificationStorage.markAllAsRead(currentGym.id, user.id);
      setNotifications([]);
    }
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
         <div className="text-[#85EC68] p-1 pl-2 pr-2 border border-white/20 rounded shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (!currentGym) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Gym Selected</h1>
          <p className="text-white/70 mb-4">Please select a gym to view the dashboard.</p>
          <Button asChild className="bg-primary hover:bg-primary/80">
            <Link to="/gyms">Select Gym</Link>
          </Button>
        </div>
      </div>
    );
  }

  const overduePayments = payments.filter(p => p.status === 'overdue');

  return (
    <LayoutWithSidebar>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* What's New Button */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 flex items-center space-x-2"
              onClick={() => setShowWhatsNew(true)}
            >
              <Sparkles className="h-4 w-4" />
              <span>What's new?</span>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-6 w-6 text-lime-500" />
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
           
            </div>
            <p className="text-lg font-bold text-white">{currentGym.name}</p>
            <p className="text-sm text-white/70">Overview & key metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Account dropdown - moved to top right */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-white hover:bg-white/10 p-2"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm hidden sm:block">{user?.name}</span>
              </Button>

              {showAccountMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-background border border-white/20 rounded-lg shadow-lg z-50">
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
<BarChart data={stats.attendanceData} style={{ cursor: 'pointer' }}>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
  <XAxis 
    dataKey="day" 
    stroke="hsl(var(--muted-foreground))"
    fontSize={12}
  />
  <YAxis 
    axisLine={false}
    tickLine={false}
    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
  />
  <Tooltip content={<CustomTooltip />} cursor={false} />
  <Bar 
    dataKey="count" 
    radius={[6, 6, 0, 0]} 
    fill="rgb(255 255 255 / 25%)"
    className="hover:fill-white/10 cursor-pointer transition-all duration-200"
    activeBar={false}
    isAnimationActive={false}
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

            {/* My Bookings / Today */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Calendar className="h-5 w-5" />
                  <span>Today</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-white">Quick actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10" asChild>
                        <Link to="/members">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add member
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10" asChild>
                        <Link to="/front-desk">
                          <LogIn className="h-4 w-4 mr-2" />
                          Check-in
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-white/70">View full schedule in Front Desk.</p>
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
                  {overduePayments.length === 0 ? (
                    <p className="text-white/70 text-center py-4">No overdue payments</p>
                  ) : (
                    overduePayments.map((payment) => {
                      const member = members.find(m => m.id === payment.memberId);
                      const displayName = member?.name ?? 'Member';
                      const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      return (
                        <div key={payment.id} className="flex items-center space-x-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{displayName}</p>
                            <p className="text-xs text-white/70 truncate">{payment.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-destructive">${payment.amount}</p>
                            <p className="text-xs text-destructive">{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '—'}</p>
                          </div>
                          <Button variant="outline" size="icon" className="h-6 w-6 border-white/20 hover:bg-white/10" asChild>
                            <Link to="/billing">
                              <FileText className="h-3 w-3 text-white" />
                            </Link>
                          </Button>
                        </div>
                      );
                    })
                  )}
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

      {showWhatsNew && (
        <WhatsNewModal onClose={() => setShowWhatsNew(false)} />
      )}
    </LayoutWithSidebar>
  );
};

// What's New Modal Component
const WhatsNewModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const announcements = [
    {
      id: 1,
      title: "New Dashboard Analytics",
      content: "Enhanced dashboard with real-time analytics and member insights. Track your gym's performance like never before.",
      date: "2024-01-15",
      type: "feature"
    },
    {
      id: 2,
      title: "Mobile App Release",
      content: "Our new mobile app is now available for iOS and Android. Members can now book classes and track workouts on the go.",
      date: "2024-01-10",
      type: "announcement"
    },
    {
      id: 3,
      title: "50% Off Premium Plan",
      content: "Limited time offer: Get 50% off your first 3 months of our Premium plan. Upgrade now to unlock advanced features.",
      date: "2024-01-08",
      type: "promotion"
    },
    {
      id: 4,
      title: "Payment Integration Update",
      content: "New payment processing system with lower fees and faster transactions. Automatic recurring billing now available.",
      date: "2024-01-05",
      type: "feature"
    },
    {
      id: 5,
      title: "Security Enhancement",
      content: "Two-factor authentication and enhanced security measures now available for all accounts.",
      date: "2024-01-01",
      type: "update"
    }
  ];

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-primary/20 text-primary';
      case 'promotion': return 'bg-yellow-500/20 text-yellow-400';
      case 'announcement': return 'bg-blue-500/20 text-blue-400';
      case 'update': return 'bg-green-500/20 text-green-400';
      default: return 'bg-white/20 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-white/20 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-white">What's New</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-white">{announcement.title}</h3>
                  <Badge className={`text-xs ${getTypeColor(announcement.type)}`}>
                    {announcement.type}
                  </Badge>
                </div>
                <span className="text-xs text-white/70">
                  {new Date(announcement.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white/80 text-sm">{announcement.content}</p>
            </div>
          ))}
          
          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/70">No announcements found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>

  ); 
};

