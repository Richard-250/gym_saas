import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Heart,
  Calendar,
  Bell,
  Settings,
  Users,
  DollarSign,
  Activity,
  CreditCard,
  FileText,
  User,
  LogOut,
  Camera,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface MemberData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  memberSince: string;
  checkinCode: string;
  status: 'Active' | 'Inactive';
  membershipType: string;
  balance: number;
  nextPayment: string;
  personalDetails: {
    birthday: string;
    gender: string;
    address: string;
  };
  programs: string[];
  attendanceData: { day: string; count: number }[];
}

export const MemberPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const memberNavItems = [
    { icon: User, label: 'Profile', key: 'profile' },
    { icon: CreditCard, label: 'Billing', key: 'billing' },
    { icon: Calendar, label: 'Attendance', key: 'attendance' },
    { icon: Calendar, label: 'Schedule', key: 'schedule' },
    { icon: FileText, label: 'Documents', key: 'documents' },
    { icon: Mail, label: 'Contact', key: 'contact' },
    { icon: LogOut, label: 'Log Out', key: 'logout' },
  ];

  useEffect(() => {
    // Get member login data
    const memberLoginData = localStorage.getItem('member_login');
    if (memberLoginData) {
      const loginData = JSON.parse(memberLoginData);
      
      // Sample member data based on the provided image
      const sampleMemberData: MemberData = {
        id: loginData.memberId,
        name: 'CYUBAHIRO Richard',
        email: 'cyubahirorichard250@gmail.com',
        phone: '(079) 252-5910',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        memberSince: '06/06/2025',
        checkinCode: '2222',
        status: 'Active',
        membershipType: 'Monthly recurring - Unlimited',
        balance: 400,
        nextPayment: '13/07/2025',
        personalDetails: {
          birthday: 'Jun 7, 2000 (25 Years old)',
          gender: 'Male',
          address: '123 Fitness Street, City'
        },
        programs: [
          'Taekwondo - White',
          'Judo - White Belt',
          'Rhythmic Gymnastics - Children/Recreation',
          'Gymnastics [1-3] Girl\'s',
          'Rhythmic [1-3] Level 1'
        ],
        attendanceData: [
          { day: 'Mon', count: 5 },
          { day: 'Tue', count: 8 },
          { day: 'Wed', count: 3 },
          { day: 'Thu', count: 12 },
          { day: 'Fri', count: 7 },
          { day: 'Sat', count: 9 },
          { day: 'Sun', count: 4 }
        ]
      };
      
      setMemberData(sampleMemberData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('member_login');
    showToast({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been logged out of the member portal'
    });
    navigate('/login');
  };

  const handleNavClick = (key: string) => {
    if (key === 'logout') {
      handleLogout();
    } else {
      setActiveTab(key);
    }
  };

  if (!memberData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Personal Details */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">PERSONAL DETAILS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm">Birthday</label>
                    <p className="text-white">{memberData.personalDetails.birthday}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Gender</label>
                    <p className="text-white">{memberData.personalDetails.gender}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-white/70 text-sm">Phone Number</label>
                  <p className="text-white">{memberData.phone}</p>
                </div>
                
                <div>
                  <label className="text-white/70 text-sm">Email Address</label>
                  <p className="text-white">{memberData.email}</p>
                </div>
                
                <div>
                  <label className="text-white/70 text-sm">Contacts</label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">BB</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white text-sm">bla bla bla (Sibling)</p>
                      <p className="text-white/70 text-xs">(078) 373-2296</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Programs */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">PROGRAMS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {memberData.programs.map((program, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-4 h-6 bg-primary rounded-sm"></div>
                      <span className="text-white text-sm">{program}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-white/70 text-sm">Balance: <span className="text-white font-medium">{memberData.balance}__</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Family Account */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">FAMILY ACCOUNT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={memberData.avatar} alt={memberData.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">CR</AvatarFallback>
                      </Avatar>
                      <span className="text-white">{memberData.name}</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Primary</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">AM</AvatarFallback>
                      </Avatar>
                      <span className="text-white">alexandre mugabo</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white">Manage</Badge>
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-primary hover:bg-primary/80">
                  ADD FAMILY MEMBER
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            {/* Membership */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Monthly recurring - Unlimited</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">Start Date</span>
                      <p className="text-white">{memberData.nextPayment}</p>
                    </div>
                    <div>
                      <span className="text-white/70">Cost</span>
                      <p className="text-white">200__ / month</p>
                    </div>
                    <div>
                      <span className="text-white/70">Duration</span>
                      <p className="text-white">Unlimited</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Monthly recurring - Unlimited Fees</p>
                      <p className="text-white/70 text-sm">Manual Payment</p>
                      <p className="text-primary text-sm">200__ (Recurring)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm">Scheduled</p>
                      <p className="text-white text-sm">13/08/2025</p>
                      <Button size="sm" variant="outline" className="mt-2 border-white/20 text-white hover:bg-white/10">
                        INVOICE
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Monthly recurring - Unlimited Fees</p>
                      <p className="text-white/70 text-sm">Manual Payment</p>
                      <p className="text-primary text-sm">200__ (Recurring)</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-primary text-sm">Paid</span>
                      </div>
                      <p className="text-white text-sm">13/07/2025</p>
                      <Button size="sm" variant="outline" className="mt-2 border-white/20 text-white hover:bg-white/10">
                        INVOICE
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Monthly recurring - Unlimited Fees</p>
                      <p className="text-white/70 text-sm">Manual Payment</p>
                      <p className="text-destructive text-sm">200__ (Recurring)</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-destructive" />
                        <span className="text-destructive text-sm">Overdue</span>
                      </div>
                      <p className="text-white text-sm">13/06/2025</p>
                      <Button size="sm" variant="outline" className="mt-2 border-white/20 text-white hover:bg-white/10">
                        INVOICE
                      </Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-primary hover:bg-primary/80">
                  PAYMENT HISTORY
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memberData.attendanceData}>
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
                    <Bar dataKey="count" fill="#85EC68" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">48</p>
                  <p className="text-white/70 text-sm">Total Visits</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-white/70 text-sm">This Month</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">3.2</p>
                  <p className="text-white/70 text-sm">Avg/Week</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2 text-white">Coming Soon</h3>
            <p className="text-white/70">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b border-white/20 bg-white/5 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Member Portal</h1>
              <p className="text-sm text-white/70">{memberData.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block fixed left-0 top-0 h-full w-[85px] bg-sidebar border-r border-sidebar-border">
          <div className="flex flex-col h-full py-4">
            {/* Logo */}
            <div className="flex items-center justify-center px-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            
            {/* Navigation Items */}
            <div className="flex flex-col space-y-1 px-2 flex-1">
              {memberNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button 
                    key={item.key}
                    variant="ghost" 
                    className={`w-full flex flex-col items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent h-16 px-1 group ${
                      activeTab === item.key ? 'bg-sidebar-accent' : ''
                    }`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <Icon className={`h-5 w-5 mb-1 ${activeTab === item.key ? 'text-primary' : ''}`} />
                    <span className="text-xs text-sidebar-foreground/80 group-hover:text-sidebar-foreground">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-[85px] flex-1">
          {/* Profile Header */}
          <div className="bg-blue-600/20 border-b border-white/20 p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={memberData.avatar} alt={memberData.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {memberData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                  {memberData.status}
                </Badge>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{memberData.name}</h1>
                <p className="text-white/70 mb-1">Member since {memberData.memberSince}</p>
                
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Camera className="h-4 w-4 mr-2" />
                    EDIT
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="text-4xl font-bold text-white mb-2">{memberData.checkinCode}</div>
                <p className="text-white/70 text-sm">Check-in code</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Mobile Navigation */}
            <div className="lg:hidden mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {memberNavItems.filter(item => item.key !== 'logout').map((item) => (
                  <Button
                    key={item.key}
                    variant={activeTab === item.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(item.key)}
                    className={`whitespace-nowrap ${
                      activeTab === item.key 
                        ? 'bg-primary text-primary-foreground' 
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
