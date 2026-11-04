import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'volunteer' | 'ngo' | 'admin';
  phone?: string;
  organization?: string;
  status: string;
  preferences: {
    notifications: boolean;
    emergencyAlerts: boolean;
    volunteerUpdates: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  name: string;
  role: 'citizen' | 'volunteer' | 'ngo' | 'admin';
  phone?: string;
  organization?: string;
  specialty?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (in production this would be in Supabase)
const USERS_STORAGE_KEY = 'disaster_mgmt_users';
const CURRENT_USER_KEY = 'disaster_mgmt_current_user';
const SESSION_KEY = 'disaster_mgmt_session';

// Helper functions for local storage
const getStoredUsers = (): any[] => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveUser = (userData: any) => {
  const users = getStoredUsers();
  users.push(userData);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const findUser = (email: string, password?: string) => {
  const users = getStoredUsers();
  if (password) {
    return users.find(u => u.email === email && u.password === password);
  }
  return users.find(u => u.email === email);
};

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);

  // Check if Supabase is configured
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error) {
          setUseSupabase(true);
          console.log('Supabase connected successfully');
        }
      } catch (error) {
        console.log('Using local authentication fallback');
        setUseSupabase(false);
      }
    };
    checkSupabase();
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (useSupabase) {
          // Try Supabase first with timeout
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Supabase connection timeout')), 5000);
          });

          const sessionPromise = supabase.auth.getSession();

          const { data: { session } } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any;
          
          if (!mounted) return;
          
          if (session) {
            setSession(session);
            // Get user profile from Supabase
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setUser({
                id: profile.id,
                email: session.user.email || '',
                name: profile.name || '',
                role: profile.role || 'citizen',
                phone: profile.phone,
                organization: profile.organization,
                status: 'active',
                preferences: profile.preferences || {
                  notifications: true,
                  emergencyAlerts: true,
                  volunteerUpdates: true
                }
              });
            }
          }
        } else {
          // Use local storage fallback
          const storedUser = localStorage.getItem(CURRENT_USER_KEY);
          const storedSession = localStorage.getItem(SESSION_KEY);
          
          if (storedUser && storedSession) {
            setUser(JSON.parse(storedUser));
            setSession(JSON.parse(storedSession));
          }
        }
      } catch (error) {
        console.log('Supabase unavailable, using local storage fallback');
        // Try local storage as fallback
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        const storedSession = localStorage.getItem(SESSION_KEY);
        
        if (storedUser && storedSession) {
          setUser(JSON.parse(storedUser));
          setSession(JSON.parse(storedSession));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for Supabase auth changes
    if (useSupabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          
          console.log('Auth state changed:', event);
          setSession(session);
          
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setUser({
                id: profile.id,
                email: session.user.email || '',
                name: profile.name || '',
                role: profile.role || 'citizen',
                phone: profile.phone,
                organization: profile.organization,
                status: 'active',
                preferences: profile.preferences || {
                  notifications: true,
                  emergencyAlerts: true,
                  volunteerUpdates: true
                }
              });
            }
          } else {
            setUser(null);
          }
          
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [useSupabase]);

  // Sign up function
  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      if (useSupabase) {
        // Try Supabase signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: userData.name,
              role: userData.role,
              phone: userData.phone,
              organization: userData.organization
            }
          }
        });

        if (error) {
          console.error('Supabase signup error:', error);
          // Fall back to local storage
          return localSignUp(email, password, userData);
        }

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              name: userData.name,
              role: userData.role,
              phone: userData.phone,
              organization: userData.organization,
              preferences: {
                notifications: true,
                emergencyAlerts: true,
                volunteerUpdates: true
              }
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          return { success: true };
        }
      }
      
      // Use local storage
      return localSignUp(email, password, userData);
    } catch (error) {
      console.error('Signup error:', error);
      // Fall back to local storage
      return localSignUp(email, password, userData);
    }
  };

  // Local signup fallback
  const localSignUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      // Check if user already exists
      const existingUser = findUser(email);
      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password, // In production, this should be hashed
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        organization: userData.organization,
        status: 'active',
        preferences: {
          notifications: true,
          emergencyAlerts: true,
          volunteerUpdates: true
        },
        createdAt: new Date().toISOString()
      };

      saveUser(newUser);

      // Auto sign in
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      
      const sessionData = {
        access_token: `local_token_${Date.now()}`,
        user: userWithoutPassword,
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      };
      
      setSession(sessionData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      return { success: true };
    } catch (error) {
      console.error('Local signup error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      if (useSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error('Supabase signin error:', error);
          // Fall back to local storage
          return localSignIn(email, password);
        }

        if (data.session) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const userData: User = {
              id: profile.id,
              email: data.user.email || '',
              name: profile.name || '',
              role: profile.role || 'citizen',
              phone: profile.phone,
              organization: profile.organization,
              status: 'active',
              preferences: profile.preferences || {
                notifications: true,
                emergencyAlerts: true,
                volunteerUpdates: true
              }
            };
            
            setUser(userData);
            setSession(data.session);
          }

          return { success: true };
        }
      }

      // Use local storage
      return localSignIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      // Fall back to local storage
      return localSignIn(email, password);
    }
  };

  // Local signin fallback
  const localSignIn = async (email: string, password: string) => {
    try {
      const foundUser = findUser(email, password);
      
      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      
      const sessionData = {
        access_token: `local_token_${Date.now()}`,
        user: userWithoutPassword,
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000
      };
      
      setSession(sessionData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      return { success: true };
    } catch (error) {
      console.error('Local signin error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      if (useSupabase && session) {
        await supabase.auth.signOut();
      }
      
      // Clear local storage
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(SESSION_KEY);
      
      setUser(null);
      setSession(null);
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      if (useSupabase && session) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) {
          console.error('Profile update error:', error);
          return localUpdateProfile(updates);
        }

        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        
        return { success: true };
      }

      return localUpdateProfile(updates);
    } catch (error) {
      console.error('Update profile error:', error);
      return localUpdateProfile(updates);
    }
  };

  // Local update profile fallback
  const localUpdateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser as User);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

      // Update in stored users array
      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === user?.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }

      return { success: true };
    } catch (error) {
      console.error('Local update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    if (useSupabase && session && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUser({
          ...user,
          ...profile
        });
      }
    } else {
      // Refresh from local storage
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}