import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, get, onValue, remove, update, serverTimestamp } from 'firebase/database';

// Firebase configuration - these should be set as environment variables in production
// For development, we'll use placeholder values that can be configured
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.databaseURL && firebaseConfig.apiKey;

// Initialize Firebase only if configured
let app = null;
let database = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase:', error.message);
  }
}

// Session-only device ID cache for when localStorage is not available
let sessionDeviceId = null;

/**
 * Check if Firebase is available and configured
 * @returns {boolean}
 */
export function isFirebaseAvailable() {
  return database !== null;
}

/**
 * Generate a unique device ID for anonymous users
 * Uses crypto.randomUUID() for better uniqueness if available
 * @returns {string}
 */
function getDeviceId() {
  try {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      // Use crypto.randomUUID if available, otherwise fallback
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        deviceId = 'device_' + crypto.randomUUID();
      } else {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      }
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.warn('localStorage access denied, using session-only device ID:', error.message);
    // Fallback to a session-only device ID if localStorage is not available
    // Cache it so all calls in the same session use the same ID
    if (!sessionDeviceId) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sessionDeviceId = 'device_' + crypto.randomUUID();
      } else {
        sessionDeviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      }
    }
    return sessionDeviceId;
  }
}

// ============= API Key Storage =============

/**
 * Save API key to Firebase or localStorage fallback
 * @param {string} apiKey
 * @returns {Promise<void>}
 */
export async function saveApiKey(apiKey) {
  const deviceId = getDeviceId();
  
  if (isFirebaseAvailable()) {
    try {
      const apiKeyRef = ref(database, `users/${deviceId}/settings/apiKey`);
      await set(apiKeyRef, {
        key: apiKey,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (error) {
      console.warn('Failed to save API key to Firebase, using localStorage:', error.message);
    }
  }
  
  // Fallback to localStorage
  try {
    localStorage.setItem('openRouterApiKey', apiKey);
  } catch (error) {
    console.warn('Failed to save API key to localStorage:', error.message);
  }
}

/**
 * Get API key from Firebase or localStorage fallback
 * @returns {Promise<string>}
 */
export async function getApiKey() {
  const deviceId = getDeviceId();
  
  if (isFirebaseAvailable()) {
    try {
      const apiKeyRef = ref(database, `users/${deviceId}/settings/apiKey`);
      const snapshot = await get(apiKeyRef);
      if (snapshot.exists()) {
        return snapshot.val().key || '';
      }
    } catch (error) {
      console.warn('Failed to get API key from Firebase, using localStorage:', error.message);
    }
  }
  
  // Fallback to localStorage
  try {
    return localStorage.getItem('openRouterApiKey') || '';
  } catch (error) {
    console.warn('Failed to access localStorage:', error.message);
    return '';
  }
}

// ============= History Storage =============

/**
 * Save a history entry to Firebase
 * @param {Object} entry - History entry object
 * @returns {Promise<string>} - The generated ID
 */
export async function saveHistoryEntry(entry) {
  const deviceId = getDeviceId();
  
  if (isFirebaseAvailable()) {
    try {
      const historyRef = ref(database, `users/${deviceId}/history`);
      const newEntryRef = push(historyRef);
      const entryWithTimestamp = {
        ...entry,
        id: newEntryRef.key,
        createdAt: serverTimestamp(),
      };
      await set(newEntryRef, entryWithTimestamp);
      return newEntryRef.key;
    } catch (error) {
      console.warn('Failed to save history to Firebase, using localStorage:', error.message);
    }
  }
  
  // Fallback to localStorage
  try {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    const newEntry = { ...entry, id: Date.now().toString() };
    const newHistory = [newEntry, ...history].slice(0, 50);
    localStorage.setItem('promptHistory', JSON.stringify(newHistory));
    return newEntry.id;
  } catch (error) {
    console.warn('Failed to save history to localStorage:', error.message);
    return Date.now().toString();
  }
}

/**
 * Get history from Firebase or localStorage
 * @returns {Promise<Array>}
 */
export async function getHistory() {
  const deviceId = getDeviceId();
  
  if (isFirebaseAvailable()) {
    try {
      const historyRef = ref(database, `users/${deviceId}/history`);
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object to array and sort by timestamp descending
        return Object.values(data)
          .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
          .slice(0, 50);
      }
    } catch (error) {
      console.warn('Failed to get history from Firebase, using localStorage:', error.message);
    }
  }
  
  // Fallback to localStorage
  try {
    return JSON.parse(localStorage.getItem('promptHistory') || '[]');
  } catch (error) {
    console.warn('Failed to access localStorage:', error.message);
    return [];
  }
}

/**
 * Clear all history
 * @returns {Promise<void>}
 */
export async function clearHistory() {
  const deviceId = getDeviceId();
  
  if (isFirebaseAvailable()) {
    try {
      const historyRef = ref(database, `users/${deviceId}/history`);
      await remove(historyRef);
    } catch (error) {
      console.warn('Failed to clear history from Firebase:', error.message);
    }
  }
  
  try {
    localStorage.removeItem('promptHistory');
  } catch (error) {
    console.warn('Failed to clear history from localStorage:', error.message);
  }
}

// ============= Public Prompts (Showcase) =============

/**
 * Save a prompt to the public showcase
 * @param {Object} promptData - Prompt data including instruction, test results, score
 * @returns {Promise<string>} - The generated ID
 */
export async function publishPrompt(promptData) {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured. Public prompts require Firebase.');
  }
  
  try {
    const publicRef = ref(database, 'publicPrompts');
    const newPromptRef = push(publicRef);
    
    const deviceId = getDeviceId();
    const publishedPrompt = {
      id: newPromptRef.key,
      ...promptData,
      authorDeviceId: deviceId,
      publishedAt: serverTimestamp(),
      views: 0,
      refinements: 0,
    };
    
    await set(newPromptRef, publishedPrompt);
    return newPromptRef.key;
  } catch (error) {
    console.error('Failed to publish prompt:', error);
    throw new Error('Failed to publish prompt: ' + error.message);
  }
}

/**
 * Get all public prompts
 * @param {number} limit - Maximum number of prompts to return
 * @returns {Promise<Array>}
 */
export async function getPublicPrompts(limit = 50) {
  if (!isFirebaseAvailable()) {
    return [];
  }
  
  try {
    const publicRef = ref(database, 'publicPrompts');
    const snapshot = await get(publicRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data)
        .sort((a, b) => {
          // Sort by score first, then by date
          if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        })
        .slice(0, limit);
    }
  } catch (error) {
    console.warn('Failed to get public prompts:', error.message);
  }
  
  return [];
}

/**
 * Subscribe to public prompts updates (real-time)
 * @param {Function} callback - Callback function with prompts array
 * @returns {Function} - Unsubscribe function
 */
export function subscribeToPublicPrompts(callback) {
  if (!isFirebaseAvailable()) {
    callback([]);
    return () => {};
  }
  
  const publicRef = ref(database, 'publicPrompts');
  
  const unsubscribe = onValue(publicRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const prompts = Object.values(data)
        .sort((a, b) => {
          if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        })
        .slice(0, 50);
      callback(prompts);
    } else {
      callback([]);
    }
  }, (error) => {
    console.warn('Error subscribing to public prompts:', error.message);
    callback([]);
  });
  
  return unsubscribe;
}

/**
 * Update a public prompt (e.g., increment views or refinements)
 * @param {string} promptId 
 * @param {Object} updates 
 * @returns {Promise<void>}
 */
export async function updatePublicPrompt(promptId, updates) {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured');
  }
  
  try {
    const promptRef = ref(database, `publicPrompts/${promptId}`);
    await update(promptRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to update public prompt:', error);
    throw error;
  }
}

/**
 * Save a refinement of a public prompt
 * @param {string} originalPromptId - The ID of the original prompt being refined
 * @param {Object} refinedPromptData - The refined prompt data
 * @returns {Promise<string>} - The new prompt ID
 */
export async function saveRefinement(originalPromptId, refinedPromptData) {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured');
  }
  
  // Increment refinement count on original
  const originalRef = ref(database, `publicPrompts/${originalPromptId}`);
  const snapshot = await get(originalRef);
  if (snapshot.exists()) {
    const current = snapshot.val();
    await update(originalRef, {
      refinements: (current.refinements || 0) + 1,
    });
  }
  
  // Publish the refinement as a new public prompt
  const refinedWithMeta = {
    ...refinedPromptData,
    refinedFrom: originalPromptId,
    isRefinement: true,
  };
  
  return publishPrompt(refinedWithMeta);
}

export { database, ref, get, set, push, onValue, update, remove, serverTimestamp };
