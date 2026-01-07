import { User } from '@/app/src/auth/auth.types';
import { ENDPOINTS } from './endpoints';
import { http } from './httpClient';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
}


export async function createUser(data: CreateUserData): Promise<User> {
  const response = await http.post<ApiResponse<User>>(
    ENDPOINTS.admin.createUser,
    data
  );
  return response.data.data;
}


