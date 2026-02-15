import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCAy9JPvV3v7J8mhqa7K1cotTWebmURgtI",
  authDomain: "schoolspace-53f0d.firebaseapp.com",
  projectId: "schoolspace-53f0d",
  storageBucket: "schoolspace-53f0d.firebasestorage.app",
  messagingSenderId: "832888496203",
  appId: "1:832888496203:web:3377bfcd63cc277c86edce",
  measurementId: "G-CCD219H76Y"
};

const app = initializeApp(firebaseConfig);

export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

export const db = getFirestore(app);
