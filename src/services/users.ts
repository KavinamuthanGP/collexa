import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  year?: string;
  createdAt: string;
}

const COLLECTION = 'users';

/**
 * Normalize a role value coming from Firestore to the canonical UserRole.
 * Firestore is the single source of truth; this only tolerates legacy data
 * written with different casing/wording (e.g. 'Admin', 'ADMIN').
 * Anything unrecognized safely falls back to 'student'.
 */
export const normalizeRole = (value: unknown): UserRole => {
  if (typeof value === 'string') {
    const cleaned = value.trim().toLowerCase();
    if (cleaned === 'admin' || cleaned === 'administrator') return 'admin';
    if (cleaned === 'student') return 'student';
  }
  return 'student';
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  await setDoc(doc(db, COLLECTION, profile.uid), profile);
};

export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserProfile;
  // Normalize legacy role formats at the read boundary so every consumer
  // sees the canonical 'admin' | 'student' value.
  return { ...data, role: normalizeRole(data.role) };
};
