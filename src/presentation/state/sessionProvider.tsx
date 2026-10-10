import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
  } from 'react';
  import type { Session } from '@supabase/supabase-js';
  import { missingSupabaseConfigMessageProduction } from '@/config/env';
  import { getSupabase } from '@/data/supabase/client';
  import { DEFAULT_WATCHLIST } from '@/domain/market/assets';
  import {
    profileFromMetadata,
    type RiskProfile,
    type UserProfile,
  } from '@/domain/profile';
  
  type AuthResult = { error: string | null; needsConfirmation?: boolean };
  
  type SessionContextValue = {
    ready: boolean;
    configured: boolean;
    session: Session | null;
    profile: UserProfile;
    signIn: (email: string, password: string) => Promise<AuthResult>;
    signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
    signOut: () => Promise<void>;
    saveProfile: (next: Pick<UserProfile, 'name' | 'riskProfile' | 'watchlist'>) => Promise<AuthResult>;
  };
  
  // Global context providing auth session state and operations across the app
  const SessionContext = createContext<SessionContextValue | null>(null);
  
  const emptyProfile: UserProfile = {
    name: '',
    email: '',
    riskProfile: 'balanced',
    watchlist: [...DEFAULT_WATCHLIST],
  };
  
  export function SessionProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const configured = getSupabase() != null;
  
    // Restores stored session on startup and listens for real-time auth changes
    useEffect(() => {
      const supabase = getSupabase();
      if (!supabase) {
        setReady(true);
        return;
      }
  
      let active = true;
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setReady(true);
      });
  
      // Subscribe to session state updates (login, logout, token refresh)
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
      });
  
      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    }, []);
  
    // Authenticates existing user credentials
    const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
      const supabase = getSupabase();
      if (!supabase) return { error: missingSupabaseConfigMessageProduction };
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { error: error.message };
      setSession(data.session);
      return { error: null };
    }, []);
  
    // Registers a new user and attaches initial profile metadata
    const signUp = useCallback(async (name: string, email: string, password: string): Promise<AuthResult> => {
      const supabase = getSupabase();
      if (!supabase) return { error: missingSupabaseConfigMessageProduction };
      if (password.length < 6) {
        return { error: 'Use at least 6 characters for the password.' };
      }
  
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: name.trim(),
            risk_profile: 'balanced',
            watchlist: [...DEFAULT_WATCHLIST],
          },
        },
      });
  
      if (error) return { error: error.message };
      setSession(data.session);
      if (!data.session) return { error: null, needsConfirmation: true };
      return { error: null };
    }, []);
  
    // Clears the current active auth session
    const signOut = useCallback(async () => {
      const supabase = getSupabase();
      if (!supabase) {
        setSession(null);
        return;
      }
      await supabase.auth.signOut();
      setSession(null);
    }, []);
  
    // Updates user metadata (name, risk preference, watchlist) directly on the Supabase user
    const saveProfile = useCallback(
      async (next: Pick<UserProfile, 'name' | 'riskProfile' | 'watchlist'>): Promise<AuthResult> => {
        const supabase = getSupabase();
        if (!supabase) return { error: missingSupabaseConfigMessageProduction };
        const { data, error } = await supabase.auth.updateUser({
          data: {
            display_name: next.name.trim(),
            risk_profile: next.riskProfile satisfies RiskProfile,
            watchlist: next.watchlist,
          },
        });
        if (error) return { error: error.message };
        setSession((current) => {
          if (!current || !data.user) return current;
          return { ...current, user: data.user };
        });
        return { error: null };
      },
      [],
    );
  
    // Derives the active user profile reactively from the current session state
    const profile = useMemo(
      () =>
        session?.user
          ? profileFromMetadata(session.user.email, session.user.user_metadata)
          : emptyProfile,
      [session],
    );
  
    const value = useMemo(
      () => ({
        ready,
        configured,
        session,
        profile,
        signIn,
        signUp,
        signOut,
        saveProfile,
      }),
      [ready, configured, session, profile, signIn, signUp, signOut, saveProfile],
    );
  
    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
  }
  
  // Hook to consume session and user profile data inside components
  export function useSession() {
    const value = useContext(SessionContext);
    if (!value) {
      throw new Error('useSession must be used inside SessionProvider');
    }
    return value;
  }