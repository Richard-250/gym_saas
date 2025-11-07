import { User, Gym, Member, Session, Payment, Task, Notification } from '@shared/types';

const STORAGE_KEYS = {
  USER: 'gym_saas_user',
  USERS: 'gym_saas_users',
  GYMS: 'gym_saas_gyms',
  MEMBERS: 'gym_saas_members',
  SESSIONS: 'gym_saas_sessions',
  PAYMENTS: 'gym_saas_payments',
  TASKS: 'gym_saas_tasks',
  NOTIFICATIONS: 'gym_saas_notifications',
  CURRENT_GYM: 'gym_saas_current_gym',
} as const;

// Generic storage utilities
const getStorageItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

const setStorageItem = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

// User storage (current logged in user)
export const userStorage = {
  get: (): User | null => getStorageItem<User>(STORAGE_KEYS.USER),
  set: (user: User): void => setStorageItem(STORAGE_KEYS.USER, user),
  remove: (): void => removeStorageItem(STORAGE_KEYS.USER),
};

// Users list storage (all registered accounts)
type StoredUser = { user: User; password?: string };
export const usersStorage = {
  getAll: (): StoredUser[] => getStorageItem<StoredUser[]>(STORAGE_KEYS.USERS) || [],
  setAll: (users: StoredUser[]): void => setStorageItem(STORAGE_KEYS.USERS, users),
  findByEmail: (email: string): StoredUser | null => {
    const users = usersStorage.getAll();
    return users.find(u => u.user.email.toLowerCase() === email.toLowerCase()) || null;
  },
  add: (user: User, password?: string): void => {
    const users = usersStorage.getAll();
    users.push({ user, password });
    usersStorage.setAll(users);
  },
  updateUser: (userId: string, updates: Partial<User>): void => {
    const users = usersStorage.getAll();
    const index = users.findIndex(u => u.user.id === userId);
    if (index !== -1) {
      users[index].user = { ...users[index].user, ...updates } as User;
      usersStorage.setAll(users);
    }
  },
  remove: (userId: string): void => {
    const users = usersStorage.getAll().filter(u => u.user.id !== userId);
    usersStorage.setAll(users);
  },
};

// Gym storage
export const gymStorage = {
  getAll: (): Gym[] => getStorageItem<Gym[]>(STORAGE_KEYS.GYMS) || [],
  set: (gyms: Gym[]): void => setStorageItem(STORAGE_KEYS.GYMS, gyms),
  add: (gym: Gym): void => {
    const gyms = gymStorage.getAll();
    gyms.push(gym);
    gymStorage.set(gyms);
  },
  update: (gymId: string, updates: Partial<Gym>): void => {
    const gyms = gymStorage.getAll();
    const index = gyms.findIndex(g => g.id === gymId);
    if (index !== -1) {
      gyms[index] = { ...gyms[index], ...updates } as Gym;
      gymStorage.set(gyms);
    }
  },
  remove: (gymId: string): void => {
    const gyms = gymStorage.getAll().filter(g => g.id !== gymId);
    gymStorage.set(gyms);
  },
  getById: (gymId: string): Gym | null => {
    const gyms = gymStorage.getAll();
    return gyms.find(g => g.id === gymId) || null;
  },
};

// Current gym selection
export const currentGymStorage = {
  get: (): string | null => getStorageItem<string>(STORAGE_KEYS.CURRENT_GYM),
  set: (gymId: string): void => setStorageItem(STORAGE_KEYS.CURRENT_GYM, gymId),
  remove: (): void => removeStorageItem(STORAGE_KEYS.CURRENT_GYM),
};

// Members storage
export const memberStorage = {
  getAll: (): Member[] => getStorageItem<Member[]>(STORAGE_KEYS.MEMBERS) || [],
  getByGym: (gymId: string): Member[] => {
    const members = memberStorage.getAll();
    return members.filter(m => m.gymId === gymId);
  },
  set: (members: Member[]): void => setStorageItem(STORAGE_KEYS.MEMBERS, members),
  add: (member: Member): void => {
    const members = memberStorage.getAll();
    members.push(member);
    memberStorage.set(members);
  },
  update: (memberId: string, updates: Partial<Member>): void => {
    const members = memberStorage.getAll();
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      members[index] = { ...members[index], ...updates } as Member;
      memberStorage.set(members);
    }
  },
  remove: (memberId: string): void => {
    const members = memberStorage.getAll().filter(m => m.id !== memberId);
    memberStorage.set(members);
  },
};

// Sessions storage
export const sessionStorage = {
  getAll: (): Session[] => getStorageItem<Session[]>(STORAGE_KEYS.SESSIONS) || [],
  getByGym: (gymId: string): Session[] => {
    const sessions = sessionStorage.getAll();
    return sessions.filter(s => s.gymId === gymId);
  },
  set: (sessions: Session[]): void => setStorageItem(STORAGE_KEYS.SESSIONS, sessions),
  add: (session: Session): void => {
    const sessions = sessionStorage.getAll();
    sessions.push(session);
    sessionStorage.set(sessions);
  },
  update: (sessionId: string, updates: Partial<Session>): void => {
    const sessions = sessionStorage.getAll();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates } as Session;
      sessionStorage.set(sessions);
    }
  },
  remove: (sessionId: string): void => {
    const sessions = sessionStorage.getAll().filter(s => s.id !== sessionId);
    sessionStorage.set(sessions);
  },
};

// Payments storage
export const paymentStorage = {
  getAll: (): Payment[] => getStorageItem<Payment[]>(STORAGE_KEYS.PAYMENTS) || [],
  getByGym: (gymId: string): Payment[] => {
    const payments = paymentStorage.getAll();
    return payments.filter(p => p.gymId === gymId);
  },
  set: (payments: Payment[]): void => setStorageItem(STORAGE_KEYS.PAYMENTS, payments),
  add: (payment: Payment): void => {
    const payments = paymentStorage.getAll();
    payments.push(payment);
    paymentStorage.set(payments);
  },
  update: (paymentId: string, updates: Partial<Payment>): void => {
    const payments = paymentStorage.getAll();
    const index = payments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates } as Payment;
      paymentStorage.set(payments);
    }
  },
};

// Tasks storage
export const taskStorage = {
  getAll: (): Task[] => getStorageItem<Task[]>(STORAGE_KEYS.TASKS) || [],
  getByGym: (gymId: string): Task[] => {
    const tasks = taskStorage.getAll();
    return tasks.filter(t => t.gymId === gymId);
  },
  set: (tasks: Task[]): void => setStorageItem(STORAGE_KEYS.TASKS, tasks),
  add: (task: Task): void => {
    const tasks = taskStorage.getAll();
    tasks.push(task);
    taskStorage.set(tasks);
  },
  update: (taskId: string, updates: Partial<Task>): void => {
    const tasks = taskStorage.getAll();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates } as Task;
      taskStorage.set(tasks);
    }
  },
  remove: (taskId: string): void => {
    const tasks = taskStorage.getAll().filter(t => t.id !== taskId);
    taskStorage.set(tasks);
  },
};

// Notifications storage
export const notificationStorage = {
  getAll: (): Notification[] => getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS) || [],
  getByUser: (userId: string): Notification[] => {
    const notifications = notificationStorage.getAll();
    return notifications.filter(n => n.userId === userId);
  },
  set: (notifications: Notification[]): void => setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications),
  add: (notification: Notification): void => {
    const notifications = notificationStorage.getAll();
    notifications.push(notification);
    notificationStorage.set(notifications);
  },
  markAsRead: (notificationId: string): void => {
    const notifications = notificationStorage.getAll();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      notificationStorage.set(notifications);
    }
  },
  markAllAsRead: (userId: string): void => {
    const notifications = notificationStorage.getAll();
    const updated = notifications.map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    notificationStorage.set(updated);
  },
};

// Clear all data (for logout)
export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
};
