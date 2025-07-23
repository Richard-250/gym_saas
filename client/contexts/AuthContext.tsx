import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Gym } from '@shared/types';
import { userStorage, gymStorage, currentGymStorage } from '@/lib/storage';
import { generateSampleUser, generateSampleGyms } from '@/lib/sample-data';

interface AuthContextType {
  user: User | null;
  currentGym: Gym | null;
  userGyms: Gym[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentGym: (gymId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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

      // If no data exists, create sample data
      if (!storedUser || storedGyms.length === 0) {
        storedUser = generateSampleUser();
        storedGyms = generateSampleGyms();
        
        userStorage.set(storedUser);
        gymStorage.set(storedGyms);
      }

      setUser(storedUser);
      
      // Filter gyms based on user's assignments
      const accessibleGyms = storedGyms.filter(gym => 
        storedUser!.gymAssignments.some(assignment => assignment.gymId === gym.id)
      );
      setUserGyms(accessibleGyms);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email/password
      let storedUser = userStorage.get();
      if (!storedUser) {
        storedUser = generateSampleUser();
        userStorage.set(storedUser);
      }

      setUser(storedUser);
      
      // Load gyms
      let storedGyms = gymStorage.getAll();
      if (storedGyms.length === 0) {
        storedGyms = generateSampleGyms();
        gymStorage.set(storedGyms);
      }

      const accessibleGyms = storedGyms.filter(gym => 
        storedUser!.gymAssignments.some(assignment => assignment.gymId === gym.id)
      );
      setUserGyms(accessibleGyms);

      if (accessibleGyms.length > 0) {
        setCurrentGymState(accessibleGyms[0]);
        currentGymStorage.set(accessibleGyms[0].id);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
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

  const value: AuthContextType = {
    user,
    currentGym,
    userGyms,
    login,
    logout,
    setCurrentGym,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
