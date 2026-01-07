import { ENDPOINTS } from './endpoints';
import { http } from './httpClient';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface Attendance {
  _id: string;
  userId: string;
  classId: string;
  sessionId: string;
  status: 'accepted' | 'rejected';
  markedAt: string;
  similarityScore: number;
  timestamp: string;
}

export interface AttendanceWithDetails {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  classId: string;
  sessionId: string;
  status: 'accepted' | 'rejected';
  markedAt: string;
  similarityScore: number;
  timestamp: string;
}

export interface MarkAttendanceData {
  classId: string;
  sessionId: string;
  faceEmbedding: number[];
  blinkVerified: boolean;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

export interface MarkAttendanceByImageData {
  classId: string;
  sessionId: string;
  faceImgBase64: string;
  blinkVerified: boolean;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
}

/**
 * Mark attendance (student only)
 */
export async function markAttendance(data: MarkAttendanceData): Promise<Attendance> {
  const response = await http.post<ApiResponse<Attendance>>(
    ENDPOINTS.attendance.mark,
    data
  );
  return response.data.data;
}

/**
 * Mark attendance by image (server-side embedding)
 */
export async function markAttendanceByImage(data: MarkAttendanceByImageData): Promise<Attendance> {
  const response = await http.post<ApiResponse<Attendance>>(
    ENDPOINTS.attendance.mark,
    data
  );
  return response.data.data;
}

/**
 * Get attendance list for a session (admin only)
 */
export async function getSessionAttendance(
  sessionId: string
): Promise<AttendanceWithDetails[]> {
  const response = await http.get<ApiResponse<AttendanceWithDetails[]>>(
    ENDPOINTS.attendance.listBySession(sessionId)
  );
  return response.data.data;
}
