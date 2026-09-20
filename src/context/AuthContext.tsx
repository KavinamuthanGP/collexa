import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { fetchUserProfile } from '@/services/users';
import type { AppUser } from '@/types';
import type { UserProfile } from '@/services/users';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  logout: () => Promise<void>;
  /**
   * Re-read the signed-in user's profile from Firestore (the single source of
   * truth for the role) and update auth state. Used by signup/login so the
   * role is guaranteed correct before navigating to a dashboard.
   */
  refreshUser: () => Promise<AppUser | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  isStudent: false,
  logout: async () => {},
  refreshUser: async () => null,
});

export const useAuth = () => useContext(AuthContext);

const toAppUser = (fbUser: User, profile: UserProfile | null): AppUser => ({
  uid: fbUser.uid,
  email: fbUser.email,
  displayName: profile?.displayName || fbUser.displayName,
  // fetchUserProfile normalizes legacy role formats; missing profile docs
  // (legacy accounts) fall back to 'student'.
  role: profile ? profile.role : 'student',
  department: profile?.department,
  year: profile?.year,
});

/**
 * Fetch the user profile from Firestore, retrying a few times.
 * This bridges the signup race: `onAuthStateChanged` fires as soon as the
 * Auth account exists, potentially BEFORE the profile document write lands.
 * Retrying (instead of instantly defaulting) means the role is read from the
 * profile doc once it exists. Also rides out transient read errors that
 * previously downgraded admins to the 'student' fallback.
 */
const loadProfileWithRetry = async (
  uid: string,
  attempts = 4,
  delayMs = 400,
): Promise<UserProfile | null> => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const profile = await fetchUserProfile(uid);
      if (profile) return profile;
    } catch (err) {
      console.warn('AuthContext: profile fetch failed, retrying', err);
    }
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = await loadProfileWithRetry(fbUser.uid);
        if (profile) {
          setUser(toAppUser(fbUser, profile));
        } else {
          // Fallback for users without a profile doc (legacy accounts).
          console.warn('AuthContext: no profile doc found for user, defaulting to student role');
          setUser(toAppUser(fbUser, null));
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshUser = async (): Promise<AppUser | null> => {
    const fbUser = auth.currentUser;
    if (!fbUser) return null;
    // The profile was just written, so a short retry is enough here.
    const profile = await loadProfileWithRetry(fbUser.uid, 3, 300);
    const next = toAppUser(fbUser, profile);
    setFirebaseUser(fbUser);
    setUser(next);
    return next;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin, isStudent, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
