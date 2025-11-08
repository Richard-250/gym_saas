import { Member, Session, Payment, Task, Notification } from '@shared/types';

// Gym-specific storage utilities
export const createGymStorageKey = (gymId: string, dataType: string): string => {
  return `gym_${gymId}_${dataType}`;
};

// Generic gym-specific storage functions
const getGymStorageItem = <T>(gymId: string, dataType: string): T[] => {
  try {
    const key = createGymStorageKey(gymId, dataType);
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error getting ${dataType} for gym ${gymId}:`, error);
    return [];
  }
};

const setGymStorageItem = <T>(gymId: string, dataType: string, data: T[]): void => {
  try {
    const key = createGymStorageKey(gymId, dataType);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error setting ${dataType} for gym ${gymId}:`, error);
  }
};

// Gym-specific member storage
export const gymMemberStorage = {
  getAll: (gymId: string): Member[] => getGymStorageItem<Member>(gymId, 'members'),
  
  set: (gymId: string, members: Member[]): void => {
    setGymStorageItem(gymId, 'members', members);
  },
  
  add: (gymId: string, member: Member): void => {
    const members = gymMemberStorage.getAll(gymId);
    members.push(member);
    gymMemberStorage.set(gymId, members);
  },
  
  update: (gymId: string, memberId: string, updates: Partial<Member>): void => {
    const members = gymMemberStorage.getAll(gymId);
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      members[index] = { ...members[index], ...updates };
      gymMemberStorage.set(gymId, members);
    }
  },
  
  remove: (gymId: string, memberId: string): void => {
    const members = gymMemberStorage.getAll(gymId).filter(m => m.id !== memberId);
    gymMemberStorage.set(gymId, members);
  },
  
  getById: (gymId: string, memberId: string): Member | null => {
    const members = gymMemberStorage.getAll(gymId);
    return members.find(m => m.id === memberId) || null;
  }
};

// Gym-specific session storage
export const gymSessionStorage = {
  getAll: (gymId: string): Session[] => getGymStorageItem<Session>(gymId, 'sessions'),
  
  set: (gymId: string, sessions: Session[]): void => {
    setGymStorageItem(gymId, 'sessions', sessions);
  },
  
  add: (gymId: string, session: Session): void => {
    const sessions = gymSessionStorage.getAll(gymId);
    sessions.push(session);
    gymSessionStorage.set(gymId, sessions);
  },
  
  update: (gymId: string, sessionId: string, updates: Partial<Session>): void => {
    const sessions = gymSessionStorage.getAll(gymId);
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      gymSessionStorage.set(gymId, sessions);
    }
  },
  
  remove: (gymId: string, sessionId: string): void => {
    const sessions = gymSessionStorage.getAll(gymId).filter(s => s.id !== sessionId);
    gymSessionStorage.set(gymId, sessions);
  }
};

// Gym-specific payment storage
export const gymPaymentStorage = {
  getAll: (gymId: string): Payment[] => getGymStorageItem<Payment>(gymId, 'payments'),
  
  set: (gymId: string, payments: Payment[]): void => {
    setGymStorageItem(gymId, 'payments', payments);
  },
  
  add: (gymId: string, payment: Payment): void => {
    const payments = gymPaymentStorage.getAll(gymId);
    payments.push(payment);
    gymPaymentStorage.set(gymId, payments);
  },
  
  update: (gymId: string, paymentId: string, updates: Partial<Payment>): void => {
    const payments = gymPaymentStorage.getAll(gymId);
    const index = payments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates };
      gymPaymentStorage.set(gymId, payments);
    }
  }
};

// Gym-specific task storage
export const gymTaskStorage = {
  getAll: (gymId: string): Task[] => getGymStorageItem<Task>(gymId, 'tasks'),
  
  set: (gymId: string, tasks: Task[]): void => {
    setGymStorageItem(gymId, 'tasks', tasks);
  },
  
  add: (gymId: string, task: Task): void => {
    const tasks = gymTaskStorage.getAll(gymId);
    tasks.push(task);
    gymTaskStorage.set(gymId, tasks);
  },
  
  update: (gymId: string, taskId: string, updates: Partial<Task>): void => {
    const tasks = gymTaskStorage.getAll(gymId);
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      gymTaskStorage.set(gymId, tasks);
    }
  },
  
  remove: (gymId: string, taskId: string): void => {
    const tasks = gymTaskStorage.getAll(gymId).filter(t => t.id !== taskId);
    gymTaskStorage.set(gymId, tasks);
  }
};

// Gym-specific notification storage
export const gymNotificationStorage = {
  getAll: (gymId: string): Notification[] => getGymStorageItem<Notification>(gymId, 'notifications'),

  set: (gymId: string, notifications: Notification[]): void => {
    setGymStorageItem(gymId, 'notifications', notifications);
  },

  add: (gymId: string, notification: Notification): void => {
    const notifications = gymNotificationStorage.getAll(gymId);
    notifications.push(notification);
    gymNotificationStorage.set(gymId, notifications);
  },

  markAsRead: (gymId: string, notificationId: string): void => {
    const notifications = gymNotificationStorage.getAll(gymId);
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      gymNotificationStorage.set(gymId, notifications);
    }
  },

  markAllAsRead: (gymId: string, userId: string): void => {
    const notifications = gymNotificationStorage.getAll(gymId);
    const updated = notifications.map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    gymNotificationStorage.set(gymId, updated);
  }
};

// Gym-specific payroll storage
export const gymPayrollStorage = {
  getAll: (gymId: string) => getGymStorageItem<any>(gymId, 'payrolls'),

  set: (gymId: string, items: any[]): void => {
    setGymStorageItem(gymId, 'payrolls', items);
  },

  add: (gymId: string, item: any): void => {
    const items = gymPayrollStorage.getAll(gymId);
    items.push(item);
    gymPayrollStorage.set(gymId, items);
  },

  update: (gymId: string, itemId: string, updates: Partial<any>): void => {
    const items = gymPayrollStorage.getAll(gymId);
    const index = items.findIndex((p: any) => p.id === itemId);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      gymPayrollStorage.set(gymId, items);
    }
  },

  remove: (gymId: string, itemId: string): void => {
    const items = gymPayrollStorage.getAll(gymId).filter((p: any) => p.id !== itemId);
    gymPayrollStorage.set(gymId, items as any);
  }
};

// Initialize sample data for a gym
export const initializeGymData = (gymId: string) => {
  // Sample members
  const sampleMembers: Member[] = [
    {
      id: `member-${gymId}-1`,
      gymId,
      name: 'alexandre mugabo',
      email: 'alexandre@example.com',
      phone: '000000000000000000',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      membershipType: 'No Active Membership',
      startDate: new Date('2023-01-15').toISOString(),
      status: 'active',
      lastCheckin: new Date('2024-01-14').toISOString()
    },
    {
      id: `member-${gymId}-2`,
      gymId,
      name: 'CYUBAHIRO Richard',
      email: 'cyubahiro@example.com',
      phone: '(079) 252-5910',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      membershipType: 'Monthly recurring - Unlimited',
      startDate: new Date('2023-02-10').toISOString(),
      status: 'active',
      lastCheckin: new Date('2024-01-13').toISOString()
    },
    {
      id: `member-${gymId}-3`,
      gymId,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b884?w=150&h=150&fit=crop&crop=face',
      membershipType: 'Premium Monthly',
      startDate: new Date('2023-03-20').toISOString(),
      status: 'active',
      lastCheckin: new Date('2024-01-12').toISOString()
    }
  ];
  
  // Sample tasks
  const sampleTasks: Task[] = [
    {
      id: `task-${gymId}-1`,
      gymId,
      assignedTo: 'trainer-1',
      title: 'Equipment Maintenance',
      description: 'Check treadmill belt tension',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: `task-${gymId}-2`,
      gymId,
      assignedTo: 'trainer-2',
      title: 'Class Preparation',
      description: 'Prepare yoga mats for evening class',
      priority: 'medium',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    }
  ];
  
  // Sample payments
  const samplePayments: Payment[] = [
    {
      id: `payment-${gymId}-1`,
      gymId,
      memberId: `member-${gymId}-1`,
      amount: 149.99,
      currency: 'USD',
      status: 'overdue',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Monthly membership fee'
    },
    {
      id: `payment-${gymId}-2`,
      gymId,
      memberId: `member-${gymId}-2`,
      amount: 99.99,
      currency: 'USD',
      status: 'paid',
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Personal training session'
    }
  ];
  
  // Sample notifications
  const sampleNotifications: Notification[] = [
    {
      id: `notif-${gymId}-1`,
      userId: 'user-1',
      gymId,
      type: 'payment',
      title: 'Payment Overdue',
      message: 'alexandre mugabo has an overdue payment of $149.99',
      read: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: `notif-${gymId}-2`,
      userId: 'user-1',
      gymId,
      type: 'checkin',
      title: 'New Check-in',
      message: 'CYUBAHIRO Richard checked in for today\'s workout',
      read: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ];
  
  // Only initialize if data doesn't exist
  if (gymMemberStorage.getAll(gymId).length === 0) {
    gymMemberStorage.set(gymId, sampleMembers);
  }
  
  if (gymTaskStorage.getAll(gymId).length === 0) {
    gymTaskStorage.set(gymId, sampleTasks);
  }
  
  if (gymPaymentStorage.getAll(gymId).length === 0) {
    gymPaymentStorage.set(gymId, samplePayments);
  }
  
  if (gymNotificationStorage.getAll(gymId).length === 0) {
    gymNotificationStorage.set(gymId, sampleNotifications);
  }
};

// Clear all data for a specific gym
export const clearGymData = (gymId: string) => {
  const dataTypes = ['members', 'sessions', 'payments', 'tasks', 'notifications'];
  dataTypes.forEach(dataType => {
    const key = createGymStorageKey(gymId, dataType);
    localStorage.removeItem(key);
  });
};
