import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off
} from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../config/firebase.config.js';

// Initialize Firebase
let app;
let database;
let auth;
let isAuthenticated = false;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Authenticate anonymously (required for database access with security rules)
const ensureAuthenticated = async () => {
  if (!auth) return false;

  if (isAuthenticated) return true;

  try {
    await signInAnonymously(auth);
    isAuthenticated = true;
    console.log('Firebase: Authenticated anonymously');
    return true;
  } catch (error) {
    console.error('Firebase authentication error:', error);
    return false;
  }
};

// Listen for auth state changes
if (auth) {
  onAuthStateChanged(auth, (user) => {
    isAuthenticated = !!user;
    if (user) {
      console.log('Firebase: User authenticated', user.uid);
    }
  });
}

// Database references
const getRef = (path) => ref(database, path);

// Save entire state to Firebase
export const saveStateToFirebase = async (state) => {
  if (!database) {
    console.warn('Firebase not initialized, using localStorage fallback');
    localStorage.setItem('podGradingState', JSON.stringify(state));
    return;
  }

  try {
    // Ensure authenticated before writing
    await ensureAuthenticated();

    await set(getRef('podGradingData'), {
      ...state,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    // Fallback to localStorage
    localStorage.setItem('podGradingState', JSON.stringify(state));
  }
};

// Load state from Firebase
export const loadStateFromFirebase = async () => {
  if (!database) {
    console.warn('Firebase not initialized, using localStorage fallback');
    const saved = localStorage.getItem('podGradingState');
    return saved ? JSON.parse(saved) : null;
  }

  try {
    // Ensure authenticated before reading
    await ensureAuthenticated();

    const snapshot = await get(getRef('podGradingData'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('podGradingState');
    return saved ? JSON.parse(saved) : null;
  }
};

// Subscribe to real-time updates
export const subscribeToStateChanges = (callback) => {
  if (!database) {
    console.warn('Firebase not initialized');
    return () => {};
  }

  let unsubscribeFunction = null;
  let isUnsubscribed = false;

  // Authenticate first, then subscribe
  ensureAuthenticated().then(() => {
    if (isUnsubscribed) return; // Don't subscribe if already unsubscribed

    const stateRef = getRef('podGradingData');

    unsubscribeFunction = onValue(stateRef, (snapshot) => {
      if (snapshot.exists() && !isUnsubscribed) {
        callback(snapshot.val());
      }
    }, (error) => {
      console.error('Error subscribing to Firebase:', error);
    });
  }).catch((error) => {
    console.error('Error authenticating for Firebase subscription:', error);
  });

  // Return unsubscribe function
  return () => {
    isUnsubscribed = true;
    if (unsubscribeFunction) {
      unsubscribeFunction();
    }
  };
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return database !== null &&
         firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
         !firebaseConfig.apiKey.includes('YOUR_');
};

export { database };
