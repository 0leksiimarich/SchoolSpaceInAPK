import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  city: string;
  school?: string;
  class?: string;
  photoURL: string;
  isAdmin?: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, city: string, school: string, classNum: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        setProfile({
          uid,
          displayName: 'Користувач',
          city: '',
          photoURL: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        });
      }
    } catch (e: any) {
      console.warn('Profile load error (may be normal if rules restrict):', e.code);
      setProfile({
        uid,
        displayName: user?.email?.split('@')[0] || 'Користувач',
        city: '',
        photoURL: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await loadProfile(cred.user.uid);
  };

  const signUp = async (email: string, password: string, name: string, city: string, school: string, classNum: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile: UserProfile = {
      uid: cred.user.uid,
      displayName: name,
      city,
      school,
      class: classNum,
      photoURL: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      isAdmin: false,
    };
    await setDoc(doc(db, 'users', cred.user.uid), userProfile);
    setProfile(userProfile);
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.uid);
    }
  };

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
    resetPassword,
    refreshProfile,
  }), [user, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
