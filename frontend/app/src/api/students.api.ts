import { ENDPOINTS } from './endpoints';
import { http } from './httpClient';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface Class {
  _id: string;
  name: string;
  description: string;
}

export interface Session {
  _id: string;
  classId: string;
  startTime: string;
  endTime: string;
  geofence: {
    lat: number;
    lng: number;
    radius: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  userId: string;
  classId: {
    _id: string;
    name: string;
  };
  sessionId: {
    _id: string;
    startTime: string;
    endTime: string;
  };
  status: 'accepted' | 'rejected';
  markedAt: string;
  similarityScore: number;
  timestamp: string;
}

/**
 * Get student's classes
 */
export async function getMyClasses(): Promise<Class[]> {
  const response = await http.get<ApiResponse<Class[]>>(
    ENDPOINTS.students.classes
  );
  return response.data.data;
}

/**
 * Get active session for a class
 */
export async function getActiveSession(classId: string): Promise<Session> {
  const response = await http.get<ApiResponse<Session>>(
    ENDPOINTS.students.activeSession(classId)
  );
  return response.data.data;
}

/**
 * Get student's attendance history
 */
export async function getMyAttendance(): Promise<AttendanceRecord[]> {
  const response = await http.get<ApiResponse<AttendanceRecord[]>>(
    ENDPOINTS.students.attendance
  );
  return response.data.data;
}
