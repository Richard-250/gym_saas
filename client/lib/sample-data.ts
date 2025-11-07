import { User, Gym, Member, Session, Payment, Task, Notification, DashboardStats } from '@shared/types';

export const generateSampleUser = (): User => ({
  id: 'user-1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  role: 'owner',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  createdAt: new Date().toISOString(),
  gymAssignments: [
    { gymId: 'gym-1', role: 'owner', permissions: ['all'] },
    { gymId: 'gym-2', role: 'owner', permissions: ['all'] }
  ]
});

export const generateSampleGyms = (): Gym[] => [
  {
    id: 'gym-1',
    name: 'Avancia Fitness',
    description: 'Premium fitness center with state-of-the-art equipment',
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
    ownerId: 'user-1',
    settings: {
      timezone: 'Africa/Kigali',
      currency: 'RWF',
      address: '123 Fitness St, Kigali, Rwanda',
      phone: '+250 788 000 000',
      email: 'contact@avancia.fitness',
      openingHours: {
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '22:00' },
        saturday: { open: '08:00', close: '20:00' },
        sunday: { open: '08:00', close: '20:00' }
      },
      features: ['Personal Training', 'Group Classes', 'Swimming Pool', 'Sauna']
    },
    subscription: {
      id: 'sub-1',
      planType: 'trial',
      status: 'active',
      trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 15
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gym-2',
    name: 'Elite Training Center',
    description: 'Professional athletic training facility',
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    ownerId: 'user-1',
    settings: {
      timezone: 'UTC',
      currency: 'USD',
      address: '456 Athletic Ave, City, State 12345',
      phone: '+1 (555) 987-6543',
      email: 'info@elitetraining.com',
      openingHours: {
        monday: { open: '05:00', close: '23:00' },
        tuesday: { open: '05:00', close: '23:00' },
        wednesday: { open: '05:00', close: '23:00' },
        thursday: { open: '05:00', close: '23:00' },
        friday: { open: '05:00', close: '23:00' },
        saturday: { open: '07:00', close: '21:00' },
        sunday: { open: '07:00', close: '21:00' }
      },
      features: ['Olympic Lifting', 'CrossFit', 'Nutrition Coaching', 'Recovery Center']
    },
    subscription: {
      id: 'sub-2',
      planType: 'trial',
      status: 'active',
      trialEndsAt: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 22
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const generateSampleMembers = (gymId: string): Member[] => [
  {
    id: 'member-1',
    gymId,
    name: 'CYRUANIRO Richard',
    email: 'richard@example.com',
    phone: '+1 (555) 111-2222',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    membershipType: 'Premium',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    lastCheckin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'member-2',
    gymId,
    name: 'Niyomugabo Fidela',
    email: 'fidela@example.com',
    phone: '+1 (555) 333-4444',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b884?w=150&h=150&fit=crop&crop=face',
    membershipType: 'Basic',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    lastCheckin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'member-3',
    gymId,
    name: 'Alex Brown',
    email: 'alex@example.com',
    phone: '+1 (555) 555-6666',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    membershipType: 'Premium',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    lastCheckin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'member-4',
    gymId,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+1 (555) 777-8888',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    membershipType: 'Basic',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  }
];

export const generateSampleTasks = (gymId: string): Task[] => [
  {
    id: 'task-1',
    gymId,
    assignedTo: 'trainer-1',
    title: 'Cleaning',
    description: 'hey you left your t-shirt',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    gymId,
    assignedTo: 'trainer-2',
    title: 'Equipment Maintenance',
    description: 'Check treadmill belt tension',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const generateSamplePayments = (gymId: string): Payment[] => [
  {
    id: 'payment-1',
    gymId,
    memberId: 'member-1',
    amount: 149.99,
    currency: 'USD',
    status: 'overdue',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Monthly recurring - Unlimited Fees'
  },
  {
    id: 'payment-2',
    gymId,
    memberId: 'member-2',
    amount: 119.99,
    currency: 'USD',
    status: 'overdue',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Session fees'
  }
];

export const generateSampleNotifications = (userId: string, gymId: string): Notification[] => [
  {
    id: 'notif-1',
    userId,
    gymId,
    type: 'checkin',
    title: 'John Doe has a birthday today! 🎉',
    message: 'Wish them a happy birthday',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    userId,
    gymId,
    type: 'payment',
    title: 'Payment overdue Mike Wilson - $149.99',
    message: 'Payment is 3 days overdue',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    userId,
    gymId,
    type: 'booking',
    title: 'Alex Brown is ready for belt promotion!',
    message: 'Schedule a belt test session',
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const generateSampleDashboardStats = (): DashboardStats => ({
  totalMembers: 324,
  monthlyRevenue: 45678,
  activeSessions: 89,
  equipmentUsage: 67,
  memberGrowth: 12,
  revenueGrowth: 8,
  sessionGrowth: 23,
  usageGrowth: -5,
  attendanceData: [
    { day: 'Mon', count: 45 },
    { day: 'Tue', count: 52 },
    { day: 'Wed', count: 38 },
    { day: 'Thu', count: 65 },
    { day: 'Fri', count: 58 },
    { day: 'Sat', count: 72 },
    { day: 'Sun', count: 41 }
  ]
});

export const initializeSampleData = () => {
  const user = generateSampleUser();
  const gyms = generateSampleGyms();
  
  // Generate sample data for each gym
  gyms.forEach(gym => {
    const members = generateSampleMembers(gym.id);
    const tasks = generateSampleTasks(gym.id);
    const payments = generateSamplePayments(gym.id);
    const notifications = generateSampleNotifications(user.id, gym.id);
    
    // Store in localStorage (this would be done by the storage utilities)
    localStorage.setItem(`gym_${gym.id}_members`, JSON.stringify(members));
    localStorage.setItem(`gym_${gym.id}_tasks`, JSON.stringify(tasks));
    localStorage.setItem(`gym_${gym.id}_payments`, JSON.stringify(payments));
    localStorage.setItem(`gym_${gym.id}_notifications`, JSON.stringify(notifications));
  });
  
  return { user, gyms };
};
