import { ENDPOINTS } from './endpoints';
import { http } from './httpClient';
import { Session } from './students.api';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

interface CreateSessionData {
  startTime: string;
  endTime: string;
  geofence: {
    lat: number;
    lng: number;
    radius: number;
  };
}

/**
 * Create session for a class (admin only)
 */
export async function createSession(
  classId: string,
  data: CreateSessionData
): Promise<Session> {
  const response = await http.post<ApiResponse<Session>>(
    ENDPOINTS.sessions.create(classId),
    data
  );
  return response.data.data;
}

/**
 * Force end a session (admin only)
 */
export async function endSession(sessionId: string): Promise<Session> {
  const response = await http.post<ApiResponse<Session>>(
    ENDPOINTS.sessions.end(sessionId),
    {}
  );
  return response.data.data;
}

/**
 * List sessions created by the current admin
 */
export async function listAdminSessions(): Promise<Session[]> {
  const response = await http.get<ApiResponse<Session[]>>(ENDPOINTS.sessions.listMine);
  return Array.isArray(response.data.data) ? response.data.data : [];
}

/**
 * List sessions for a specific class (assumed implemented on backend)
 */
export async function listSessionsByClass(classId: string): Promise<Session[]> {
  const response = await http.get<ApiResponse<Session[]>>(ENDPOINTS.sessions.listByClass(classId));
  return Array.isArray(response.data.data) ? response.data.data : [];
}
