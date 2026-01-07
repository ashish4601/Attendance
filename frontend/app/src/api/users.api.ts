import { updateStoredUser } from '@/app/src/auth/auth.store';
import { RegisterData, User } from '@/app/src/auth/auth.types';
import { ENDPOINTS } from './endpoints';
import { http } from './httpClient';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * Register new student
 */
export async function registerStudent(data: RegisterData): Promise<User> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('password', data.password);
  
  if (data.profileImage) {
    formData.append('profileImage', data.profileImage);
  }

  const response = await http.post<ApiResponse<User>>(
    ENDPOINTS.users.register,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await http.get<ApiResponse<User>>(ENDPOINTS.users.me);
  return response.data.data;
}

/**
 * Update account details
 */
export async function updateAccount(name: string, email: string): Promise<User> {
  const response = await http.patch<ApiResponse<User>>(
    ENDPOINTS.users.me,
    { name, email }
  );
  
  const user = response.data.data;
  await updateStoredUser(user);
  
  return user;
}

/**
 * Update profile image
 */
export async function updateProfileImage(image: any): Promise<User> {
  const formData = new FormData();
  formData.append('profileImage', image);

  const response = await http.patch<ApiResponse<User>>(
    ENDPOINTS.users.profileImage,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  const user = response.data.data;
  await updateStoredUser(user);
  
  return user;
}

/**
 * Change password
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await http.post(ENDPOINTS.users.changePassword, { oldPassword, newPassword });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  const response = await http.get<ApiResponse<User>>(
    ENDPOINTS.users.getById(userId)
  );
  return response.data.data;
}
