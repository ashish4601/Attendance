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
  createdBy: string;
  students: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateClassData {
  name: string;
  description?: string;
}

interface AddStudentData {
  studentId: string;
}

/**
 * Create a new class (admin only)
 */
export async function createClass(data: CreateClassData): Promise<Class> {
  const response = await http.post<ApiResponse<Class>>(
    ENDPOINTS.classes.add,
    data
  );
  return response.data.data;
}

/**
 * Add student to class (admin only)
 */
export async function addStudentToClass(
  classId: string,
  studentEmail: string
): Promise<Class> {
  const response = await http.post<ApiResponse<Class>>(
    ENDPOINTS.classes.addStudent(classId),
    { studentEmail: studentEmail }
  );
  return response.data.data;
}

/**
 * List classes created by current admin 
 */
export async function listAdminClasses(): Promise<Class[]> {
  const response = await http.get<ApiResponse<Class[]>>(ENDPOINTS.classes.listMine);
  return Array.isArray(response.data.data) ? response.data.data : [];
}
