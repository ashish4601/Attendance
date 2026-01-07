import AsyncStorage from '@react-native-async-storage/async-storage';

const CLASSES_KEY = '@admin_classes';
const SESSIONS_KEY = '@admin_sessions';

export interface CachedClass {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface CachedSession {
  _id: string;
  classId: string;
  className: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

/**
 * Get all cached classes
 */
export async function getCachedClasses(): Promise<CachedClass[]> {
  try {
    const json = await AsyncStorage.getItem(CLASSES_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

/**
 * Add a class to cache (prepend, limit to 50)
 */
export async function addCachedClass(cls: CachedClass): Promise<void> {
  try {
    const existing = await getCachedClasses();
    const filtered = existing.filter((c) => c._id !== cls._id);
    const updated = [cls, ...filtered].slice(0, 50);
    await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get all cached sessions
 */
export async function getCachedSessions(): Promise<CachedSession[]> {
  try {
    const json = await AsyncStorage.getItem(SESSIONS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

/**
 * Add a session to cache (prepend, limit to 100)
 */
export async function addCachedSession(session: CachedSession): Promise<void> {
  try {
    const existing = await getCachedSessions();
    const filtered = existing.filter((s) => s._id !== session._id);
    const updated = [session, ...filtered].slice(0, 100);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Update session in cache (e.g., mark as ended)
 */
export async function updateCachedSession(
  sessionId: string,
  updates: Partial<CachedSession>
): Promise<void> {
  try {
    const existing = await getCachedSessions();
    const updated = existing.map((s) =>
      s._id === sessionId ? { ...s, ...updates } : s
    );
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Remove a session from cache
 */
export async function removeCachedSession(sessionId: string): Promise<void> {
  try {
    const existing = await getCachedSessions();
    const updated = existing.filter((s) => s._id !== sessionId);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear all admin cache (on logout)
 */
export async function clearAdminCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([CLASSES_KEY, SESSIONS_KEY]);
  } catch {
    // Ignore storage errors
  }
}
