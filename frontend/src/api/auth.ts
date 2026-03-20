import apiClient from './config';

export interface SignInRequest {
  idToken: string;
}

export interface SignInResponse {
  message: string;
  data?: {
    firebaseUid: string;
    email: string;
    name: string;
  };
}

export interface RegisterStudentRequest {
  idToken: string;
  fullName: string;
  semester: number;
  branch: string;
  collegeId: string;
  enrollmentNumber: string;
}

export interface RegisterTeacherRequest {
  idToken: string;
  fullName: string;
  teacherId: string;
}

export interface RegisterResponse {
  message: string;
  data: any;
}

export interface MeResponse {
  data: any;
}

export const authApi = {
  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    const response = await apiClient.post('/auth/signin', data);
    return response.data;
  },

  registerStudent: async (data: RegisterStudentRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register/student', data);
    return response.data;
  },

  registerTeacher: async (data: RegisterTeacherRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register/teacher', data);
    return response.data;
  },

  me: async (): Promise<MeResponse> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
