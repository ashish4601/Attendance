import { ENDPOINTS } from './endpoints';
import { http } from './httpClient';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface FaceData {
  _id: string;
  userId: string;
  faceEmbedding: number[];
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaceEnrollmentStatus {
  isEnrolled: boolean;
}

/**
 * Enroll face data (student only)
 */
export async function enrollFace(faceEmbedding: number[]): Promise<FaceData> {
  const response = await http.post<ApiResponse<FaceData>>(
    ENDPOINTS.faceData.enroll,
    { faceEmbedding }
  );
  return response.data.data;
}

/**
 * Enroll face data by image (server-side embedding)
 */
export async function enrollFaceByImage(faceImgBase64: string): Promise<FaceData> {
  const response = await http.post<ApiResponse<FaceData>>(
    ENDPOINTS.faceData.enroll,
    { faceImgBase64 }
  );
  return response.data.data;
}

/**
 * Get face enrollment status (student only)
 */
export async function getFaceEnrollmentStatus(): Promise<FaceEnrollmentStatus> {
  const response = await http.get<ApiResponse<FaceEnrollmentStatus>>(
    ENDPOINTS.faceData.status
  );
  return response.data.data;
}

/**
 * Reset face data for a student (admin only)
 */
export async function resetFaceData(studentId: string): Promise<FaceData> {
  const response = await http.delete<ApiResponse<FaceData>>(
    ENDPOINTS.faceData.reset(studentId)
  );
  return response.data.data;
}
