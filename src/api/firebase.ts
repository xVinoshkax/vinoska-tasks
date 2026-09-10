import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import type { FirebaseAppConfig, CloudUserData, UserProfile } from '../types';

const STORAGE_KEY_FIREBASE_CONFIG = 'vinoska_firebase_config';

export const DEFAULT_FIREBASE_CONFIG: FirebaseAppConfig = {
  apiKey: 'AIzaSyCAr2_WH0CUnGNPfbCduDTMfxBnhkQ0zgM',
  authDomain: 'vinoska-tasks.firebaseapp.com',
  projectId: 'vinoska-tasks',
  storageBucket: 'vinoska-tasks.firebasestorage.app',
  messagingSenderId: '698109121102',
  appId: '1:698109121102:web:66435bf5c5b5e5b51b691f',
};

/**
 * Reads Firebase configuration from localStorage, Vite env variables, or default project.
 */
export function getFirebaseConfig(): FirebaseAppConfig | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up old typo if present in local storage
      if (parsed.apiKey && parsed.apiKey.includes('WHOc')) {
        localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
      } else if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved Firebase config:', err);
  }

  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseAppConfig): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  window.location.reload();
}

export function removeFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
  window.location.reload();
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function getFirebaseServices(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (appInstance && authInstance && dbInstance) {
    return { app: appInstance, auth: authInstance, db: dbInstance };
  }

  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, auth: authInstance, db: dbInstance };
  } catch (err) {
    console.error('Error initializing Firebase services:', err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

const mapFirebaseUser = (user: User): UserProfile => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || user.email?.split('@')[0] || 'Пользователь',
  photoURL: user.photoURL,
});

/**
 * Translates Firebase error codes to clean Russian messages.
 */
export function formatFirebaseError(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Произошла непредвиденная ошибка';
  const code = (err as { code?: string }).code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Неверный адрес электронной почты или пароль';
    case 'auth/email-already-in-use':
      return 'Пользователь с таким email уже зарегистрирован. Попробуйте войти.';
    case 'auth/weak-password':
      return 'Пароль слишком простой (нужно не менее 6 символов)';
    case 'auth/invalid-email':
      return 'Некорректный формат адреса электронной почты';
    case 'auth/popup-closed-by-user':
      return 'Окно авторизации было закрыто до завершения входа';
    case 'auth/cancelled-popup-request':
      return 'Запрос авторизации был отменен';
    case 'auth/popup-blocked':
      return 'Всплывающее окно заблокировано браузером. Разрешите всплывающие окна.';
    case 'auth/unauthorized-domain':
      return 'Домен не добавлен в Authorized Domains в Firebase Console (Authentication -> Settings).';
    case 'permission-denied':
      return 'Доступ к Firestore запрещен (проверьте Security Rules в Firebase Console).';
    case 'unavailable':
      return 'Сервис временно недоступен. Проверьте сетевое подключение.';
    default:
      return (err as { message?: string }).message || 'Ошибка взаимодействия с Firebase';
  }
}

// ----------------- Auth API -----------------

export async function loginWithGoogle(): Promise<UserProfile> {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error('Firebase не сконфигурирован');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(services.auth, provider);
    return mapFirebaseUser(result.user);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(services.auth, provider);
      throw new Error('Перенаправление на страницу авторизации Google...');
    }
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error('Firebase не сконфигурирован');
  }
  const result = await signInWithEmailAndPassword(services.auth, email.trim(), pass);
  return mapFirebaseUser(result.user);
}

export async function registerWithEmail(email: string, pass: string): Promise<UserProfile> {
  const services = getFirebaseServices();
  if (!services) {
    throw new Error('Firebase не сконфигурирован');
  }
  const result = await createUserWithEmailAndPassword(services.auth, email.trim(), pass);
  return mapFirebaseUser(result.user);
}

export async function logoutUser(): Promise<void> {
  const services = getFirebaseServices();
  if (services) {
    await signOut(services.auth);
  }
}

export function subscribeAuth(callback: (user: UserProfile | null) => void): Unsubscribe {
  const services = getFirebaseServices();
  if (!services) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(services.auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null);
  });
}

// ----------------- Firestore Sync API -----------------

/**
 * Realtime listener on the user's primary document.
 * Passes exists flag so caller knows if this is an existing cloud profile or brand new.
 */
export function subscribeCloudUserData(
  uid: string,
  onData: (data: CloudUserData, exists: boolean) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const services = getFirebaseServices();
  if (!services) return () => {};

  const docRef = doc(services.db, 'users', uid);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const raw = snap.data() as Partial<CloudUserData>;
        onData(
          {
            tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
            projects: Array.isArray(raw.projects) ? raw.projects : [],
            habits: Array.isArray(raw.habits) ? raw.habits : [],
            priorities: Array.isArray(raw.priorities) ? raw.priorities : [],
            activity: Array.isArray(raw.activity) ? raw.activity : [],
            updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
          },
          true
        );
      } else {
        onData(
          {
            tasks: [],
            projects: [],
            habits: [],
            priorities: [],
            activity: [],
            updatedAt: 0,
          },
          false
        );
      }
    },
    (err) => {
      console.error('Firestore onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * One-off read of cloud user document.
 */
export async function fetchCloudUserData(uid: string): Promise<{ data: CloudUserData | null; exists: boolean }> {
  const services = getFirebaseServices();
  if (!services) return { data: null, exists: false };

  const docRef = doc(services.db, 'users', uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return { data: null, exists: false };

  const raw = snap.data() as Partial<CloudUserData>;
  return {
    data: {
      tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      habits: Array.isArray(raw.habits) ? raw.habits : [],
      priorities: Array.isArray(raw.priorities) ? raw.priorities : [],
      activity: Array.isArray(raw.activity) ? raw.activity : [],
      updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    },
    exists: true,
  };
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingData: Partial<CloudUserData> = {};
let pendingUid: string | null = null;

export function cancelPendingCloudSave(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  pendingData = {};
  pendingUid = null;
}

/**
 * Debounced push to Firestore (400ms) to prevent quota thrashing and network spam.
 */
export function queueSaveCloudUserData(
  uid: string,
  data: Partial<CloudUserData>,
  onSuccess?: () => void
): void {
  const services = getFirebaseServices();
  if (!services) return;

  pendingUid = uid;
  pendingData = { ...pendingData, ...data };

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    if (!pendingUid) return;
    const targetUid = pendingUid;
    const toSave = { ...pendingData, updatedAt: Date.now() };
    pendingData = {};
    pendingUid = null;

    try {
      const docRef = doc(services.db, 'users', targetUid);
      await setDoc(docRef, toSave, { merge: true });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to sync data to Firestore:', err);
    }
  }, 400);
}

/**
 * Force immediate write (e.g., initial migration on first login).
 */
export async function saveCloudUserDataImmediate(uid: string, data: Partial<CloudUserData>): Promise<void> {
  const services = getFirebaseServices();
  if (!services) return;

  const docRef = doc(services.db, 'users', uid);
  await setDoc(docRef, { ...data, updatedAt: Date.now() }, { merge: true });
}
