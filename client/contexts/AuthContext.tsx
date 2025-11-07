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
            avatar: undefined,
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

        accessibleGyms = storedGyms.filter(gym =>
          storedUser!.gymAssignments.some(assignment => assignment.gymId === gym.id)
        );
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

      // Find user from usersStorage
      const stored = usersStorage.findByEmail(email);
      if (!stored) {
        return false;
      }

      // Password check (demo only)
      if (stored.password && stored.password !== password) {
        return false;
      }

      // Set current user
      userStorage.set(stored.user);
      setUser(stored.user);

      // Admin role: can access all gyms
      if ((stored.user as any).role === 'admin') {
        setUserGyms(storedGyms);
        if (storedGyms.length > 0) {
          setCurrentGymState(storedGyms[0]);
          currentGymStorage.set(storedGyms[0].id);
        }
      } else {
        const accessibleGyms = storedGyms.filter(gym =>
          stored.user.gymAssignments.some(assignment => assignment.gymId === gym.id) ||
          gym.ownerId === stored.user.id
        );
        setUserGyms(accessibleGyms);
        if (accessibleGyms.length > 0) {
          setCurrentGymState(accessibleGyms[0]);
          currentGymStorage.set(accessibleGyms[0].id);
        }
      }

      return true;
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

      // Check if email already registered
      const existing = usersStorage.findByEmail(email);
      if (existing) {
        return { success: false, message: 'A user with that email already exists.' };
      }

      const id = `user-${Date.now()}`;
      const newUser: User = {
        id,
        name,
        email,
        role: 'owner',
        avatar: undefined,
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
      const accessibleGyms = storedGyms.filter(gym =>
        user.gymAssignments.some(assignment => assignment.gymId === gym.id) ||
        gym.ownerId === user.id // Also include gyms owned by the user
      );
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
