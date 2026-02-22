export type UserRole = 'admin' | 'owner' | 'manager' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile?: string;
  createdAt: string;
  gymAssignments: GymAssignment[];
}

export interface GymAssignment {
  gymId: string;
  role: UserRole;
  permissions: string[];
  /** paid indicates whether the user has an active paid relationship with this gym */
  paid?: boolean;
  /** Optional: user id who added this assignment */
  addedBy?: string;
}

export interface Gym {
  id: string;
  name: string;
  description: string;
  logo?: string;
  ownerId: string;
  settings: GymSettings;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
}

/** Standard address hierarchy (e.g. country → region → district → sector → cell → village) */
export interface GymAddress {
  country: string;
  region?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  addressLine?: string;
}

export interface GymSettings {
  location: GymAddress;
  timezone: string;
  currency: string;
  address: string;
  phone: string;
  email: string;
  openingHours: OpeningHours;
  features: string[];
}

export interface OpeningHours {
  monday: { open: string; close: string; closed?: boolean };
  tuesday: { open: string; close: string; closed?: boolean };
  wednesday: { open: string; close: string; closed?: boolean };
  thursday: { open: string; close: string; closed?: boolean };
  friday: { open: string; close: string; closed?: boolean };
  saturday: { open: string; close: string; closed?: boolean };
  sunday: { open: string; close: string; closed?: boolean };
}

export interface Subscription {
  id: string;
  planType: 'trial' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'canceled' | 'inactive';
  trialEndsAt?: string;
  currentPeriodEnd: string;
  daysLeft: number;
}

export interface Member {
  id: string;
  gymId: string;
  name: string;
  email: string;
  phone: string;
  profile?: string;
  membershipType: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastCheckin?: string;
  ranking?: string;
  /** Optional app-specific fields stored in gym member data */
  lastRankUpdate?: string;
  familyPrimaryId?: string;
}

export interface Session {
  id: string;
  gymId: string;
  trainerId: string;
  name: string;
  description: string;
  type: 'personal' | 'group' | 'class';
  startTime: string;
  endTime: string;
  maxParticipants?: number;
  currentParticipants: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'canceled';
}

export interface Payment {
  id: string;
  gymId: string;
  memberId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  dueDate: string;
  paidAt?: string;
  description: string;
  /** Optional: who recorded the payment (e.g. payroll) */
  performedBy?: string;
}

export interface Task {
  id: string;
  gymId: string;
  assignedTo: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  gymId: string;
  type: 'payment' | 'checkin' | 'booking' | 'system' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DashboardStats {
  totalMembers: number;
  monthlyRevenue: number;
  activeSessions: number;
  equipmentUsage: number;
  memberGrowth: number;
  revenueGrowth: number;
  sessionGrowth: number;
  usageGrowth: number;
  attendanceData: AttendanceData[];
}

export interface AttendanceData {
  day: string;
  count: number;
}

export interface Equipment {
  id: string;
  gymId: string;
  name: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  lastMaintenance?: string;
  nextMaintenance?: string;
}
