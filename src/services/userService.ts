import api from './api';
import { UserResponse, ApiResponse } from '../types/auth';

export interface UpdateNicknameRequest {
  nickName: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  nickName: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

class UserService {
  // 내 정보 조회
  async getMyProfile(): Promise<UserProfileResponse> {
    const response = await api.get<ApiResponse<UserProfileResponse>>('/api/users/profile');
    return response.data.data;
  }

  // 닉네임 변경
  async updateNickname(data: UpdateNicknameRequest): Promise<UserProfileResponse> {
    const response = await api.put<ApiResponse<UserProfileResponse>>('/api/users/profile/updateNickname', data);
    return response.data.data;
  }

  // 비밀번호 변경
  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    await api.patch<ApiResponse<void>>('/api/users/profile/updatePassword', data);
  }

  // 프로필 이미지 업로드 (선택사항)
  async uploadProfileImage(imageUri: string): Promise<UserProfileResponse> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await api.post<ApiResponse<UserProfileResponse>>('/api/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // 계정 삭제
  async deleteAccount(): Promise<void> {
    await api.delete<ApiResponse<void>>('/api/users/me');
  }
}

export const userService = new UserService();
export default userService; 