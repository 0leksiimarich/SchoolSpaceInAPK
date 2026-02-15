# SchoolSpace Mobile App

## Overview
Mobile app version of SchoolSpace (https://0leksiimarich.github.io/school-space/) - a social network for school students. Built with Expo/React Native, connected to the same Firebase backend for data synchronization.

## Architecture
- **Frontend**: Expo Router with tabs (Feed, Search, Profile)
- **Backend**: Firebase Firestore + Firebase Auth (shared with the website)
- **Auth**: Email/password authentication
- **Data sync**: Real-time Firestore listeners (onSnapshot) for live data sync between web and mobile

## Firebase Config
- Project: schoolspace-53f0d
- Uses Firestore collections: `posts`, `users`

## Key Files
- `lib/firebase.ts` - Firebase initialization
- `lib/auth-context.tsx` - Auth state management
- `app/(auth)/` - Login and registration screens
- `app/(tabs)/` - Main app tabs (Feed, Search, Profile)
- `app/create-post.tsx` - Create post modal

## Design
- Dark theme matching the website (Telegram-like dark blue)
- Colors: bg #0e1621, panel #17212b, accent #40a7e3
- Font: Inter (Google Fonts)

## Recent Changes
- Feb 2026: Initial mobile app build with Firebase integration
