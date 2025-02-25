import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching user profile:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthContext: Error fetching user profile:', error);
        throw error;
      }
      
      console.log('AuthContext: Setting user profile:', data);
      setUser(data);
    } catch (error) {
      console.error('AuthContext: Error in fetchUser:', error);
      // If user profile doesn't exist, sign out
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Signing in with email:', email);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // After successful sign in, fetch user data
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('AuthContext: Auth user after sign in:', authUser);
      
      if (authUser) {
        console.log('AuthContext: Fetching user profile for ID:', authUser.id);
        await fetchUser(authUser.id);
      } else {
        console.error('AuthContext: No auth user after sign in');
      }
    } catch (error) {
      console.error('AuthContext: Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    try {
      // Sign up with auto-confirm enabled
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });

      if (signUpError) throw signUpError;
      if (!authUser) throw new Error('No user returned after signup');

      // Create basic user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authUser.id,
            email,
            name: email.split('@')[0],
            role,
            skill_level: role === 'teacher' ? 'Basic' : null
          }
        ]);

      if (profileError) {
        console.error('Profile Error:', profileError);
        await supabase.auth.signOut();
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      // Sign in immediately after signup
      await signIn(email, password);
    } catch (error) {
      console.error('Signup process error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 