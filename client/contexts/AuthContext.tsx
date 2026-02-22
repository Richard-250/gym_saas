import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Gym } from '@shared/types';
import { userStorage, gymStorage, currentGymStorage, usersStorage } from '@/lib/storage';
import { generateSampleUser, generateSampleGyms } from '@/lib/sample-data';

interface AuthContextType {
  user: User | null;
  currentGym: Gym | null;
  userGyms: Gym[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setCurrentGym: (gymId: string) => void;
  refreshGyms: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Return a safe default if used outside provider to prevent runtime errors during render
const SAFE_DEFAULT: AuthContextType = {
  user: null,
  currentGym: null,
  userGyms: [],
  login: async () => false,
  register: async () => ({ success: false, message: 'Auth provider not initialized' }),
  logout: () => {},
  setCurrentGym: () => {},
  refreshGyms: () => {},
  isLoading: true,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context ?? SAFE_DEFAULT;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Staff storage helper
const staffStorage = {
  getAll: (gymId: string) => JSON.parse(localStorage.getItem(`gym_staff_${gymId}`) || '[]'),
  findByEmail: (email: string) => {
    // Search through all gyms for staff with matching email
    const gyms = gymStorage.getAll();
    for (const gym of gyms) {
      const staffMembers = JSON.parse(localStorage.getItem(`gym_staff_${gym.id}`) || '[]');
      const staff = staffMembers.find((s: any) => s.email === email && s.active !== false);
      if (staff) {
        return { staff, gym };
      }
    }
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentGym, setCurrentGymState] = useState<Gym | null>(null);
  const [userGyms, setUserGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      // Check if we have a stored user
      let storedUser = userStorage.get();
      let storedGyms = gymStorage.getAll();

      // Ensure gyms exist
      if (storedGyms.length === 0) {
        storedGyms = generateSampleGyms();
        gymStorage.set(storedGyms);
      }

      // Ensure users list exists and includes an admin and a default owner
      const allUsers = usersStorage.getAll();
      if (allUsers.length === 0) {
        // create admin
        const admin = {
          user: {
            id: 'admin-1',
            email: 'admin@gymsaas.test',
            name: 'System Admin',
            role: 'admin' as any,
            profile: undefined,
            createdAt: new Date().toISOString(),
            gymAssignments: []
          },
          password: 'admin123'
        };

        const owner = {
          user: generateSampleUser(),
          password: 'password'
        };

        usersStorage.setAll([admin, owner]);
      }

      // Compute accessible gyms for storedUser if present
      let accessibleGyms: Gym[] = [];
      if (storedUser) {
        setUser(storedUser);

        // Check if user is a staff member in any gym
        const staffGyms = getStaffGymsForUser(storedUser.email);
        const userAssignmentGyms = storedGyms.filter(gym =>
          storedUser!.gymAssignments.some(assignment => assignment.gymId === gym.id)
        );
        
        // Combine both staff gyms and user assignment gyms
        accessibleGyms = [...new Map([...staffGyms, ...userAssignmentGyms].map(gym => [gym.id, gym])).values()];
        setUserGyms(accessibleGyms);
      } else {
        setUser(null);
        setUserGyms([]);
      }

      // Set current gym
      const currentGymId = currentGymStorage.get();
      if (currentGymId) {
        const gym = accessibleGyms.find(g => g.id === currentGymId);
        if (gym) {
          setCurrentGymState(gym);
        } else if (accessibleGyms.length > 0) {
          setCurrentGymState(accessibleGyms[0]);
          currentGymStorage.set(accessibleGyms[0].id);
        }
      } else if (accessibleGyms.length > 0) {
        setCurrentGymState(accessibleGyms[0]);
        currentGymStorage.set(accessibleGyms[0].id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get gyms where user is a staff member
  const getStaffGymsForUser = (email: string): Gym[] => {
    const storedGyms = gymStorage.getAll();
    const staffGyms: Gym[] = [];
    
    for (const gym of storedGyms) {
      const staffMembers = staffStorage.getAll(gym.id);
      const staffMember = staffMembers.find((s: any) => 
        s.email === email && s.active !== false
      );
      if (staffMember) {
        staffGyms.push(gym);
      }
    }
    
    return staffGyms;
  };

  // Helper function to create a user object from staff data
  const createUserFromStaff = (staff: any, gym: Gym): User => {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: 'staff' as any,
      profile: typeof staff.profile === 'string' ? staff.profile : undefined,
      createdAt: staff.createdAt || new Date().toISOString(),
      gymAssignments: [
        {
          gymId: gym.id,
          role: staff.role,
          permissions: staff.permissions || [],
          paid: true
        }
      ]
    };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Ensure gyms list exists
      let storedGyms = gymStorage.getAll();
      if (storedGyms.length === 0) {
        storedGyms = generateSampleGyms();
        gymStorage.set(storedGyms);
      }

      // First, try to find user in usersStorage (owners/admins)
      const storedUser = usersStorage.findByEmail(email);
      if (storedUser) {
        // Password check for regular users
        if (storedUser.password && storedUser.password !== password) {
          return false;
        }

        // Set current user
        userStorage.set(storedUser.user);
        setUser(storedUser.user);

        // Admin role: can access all gyms
        if ((storedUser.user as any).role === 'admin') {
          setUserGyms(storedGyms);
          if (storedGyms.length > 0) {
            setCurrentGymState(storedGyms[0]);
            currentGymStorage.set(storedGyms[0].id);
          }
        } else {
          // For owners/regular users, get gyms from assignments and staff roles
          const staffGyms = getStaffGymsForUser(email);
          const userAssignmentGyms = storedGyms.filter(gym =>
            storedUser.user.gymAssignments?.some((assignment: any) => assignment.gymId === gym.id) ||
            gym.ownerId === storedUser.user.id
          );
          
          const accessibleGyms = [...new Map([...staffGyms, ...userAssignmentGyms].map(gym => [gym.id, gym])).values()];
          setUserGyms(accessibleGyms);
          
          // If user has access to exactly one gym, set it. If multiple, allow the user to choose on the /gyms page.
          if (accessibleGyms.length === 1) {
            setCurrentGymState(accessibleGyms[0]);
            currentGymStorage.set(accessibleGyms[0].id);
          } else {
            setCurrentGymState(null);
            currentGymStorage.remove();
          }
        }

        return true;
      }

      // If not found in usersStorage, check staff members across all gyms
      const staffResult = staffStorage.findByEmail(email);
      if (staffResult) {
        const { staff, gym } = staffResult;
        
        // Check staff password (in a real app, this would be properly hashed)
        if (staff.password && staff.password !== password) {
          return false;
        }

        // Create user object from staff data
        const staffUser = createUserFromStaff(staff, gym);
        
        // Set current user
        userStorage.set(staffUser);
        setUser(staffUser);

        // Staff members can only access their assigned gym
        const accessibleGyms = [gym];
        setUserGyms(accessibleGyms);
        
        // Auto-set the current gym for staff
        setCurrentGymState(gym);
        currentGymStorage.set(gym.id);

        return true;
      }

      // No user found
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new owner account (no gym created here)
  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Check if email already registered in usersStorage or staff
      const existingUser = usersStorage.findByEmail(email);
      if (existingUser) {
        return { success: false, message: 'A user with that email already exists.' };
      }

      // Check if email exists as staff member
      const existingStaff = staffStorage.findByEmail(email);
      if (existingStaff) {
        return { success: false, message: 'This email is already registered as a staff member. Please contact your gym administrator for login instructions.' };
      }

      const id = `user-${Date.now()}`;
      const newUser: User = {
        id,
        name,
        email,
        role: 'owner',
        profile: undefined,
        createdAt: new Date().toISOString(),
        gymAssignments: []
      };

      // Save to usersStorage with password
      usersStorage.add(newUser, password);

      // Set as current logged in user
      userStorage.set(newUser);
      setUser(newUser);
      setUserGyms([]);
      setCurrentGymState(null);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentGymState(null);
    setUserGyms([]);
    userStorage.remove();
    currentGymStorage.remove();
  };

  const setCurrentGym = (gymId: string) => {
    const gym = userGyms.find(g => g.id === gymId);
    if (gym) {
      setCurrentGymState(gym);
      currentGymStorage.set(gymId);
    }
  };

  const refreshGyms = () => {
    const storedGyms = gymStorage.getAll();
    const user = userStorage.get();
    if (user) {
      // Get gyms from both user assignments and staff roles
      const staffGyms = getStaffGymsForUser(user.email);
      const userAssignmentGyms = storedGyms.filter(gym =>
        user.gymAssignments.some(assignment => assignment.gymId === gym.id) ||
        gym.ownerId === user.id
      );
      
      const accessibleGyms = [...new Map([...staffGyms, ...userAssignmentGyms].map(gym => [gym.id, gym])).values()];
      setUserGyms(accessibleGyms);
    }
  };

  const value: AuthContextType = {
    user,
    currentGym,
    userGyms,
    login,
    register,
    logout,
    setCurrentGym,
    refreshGyms,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};