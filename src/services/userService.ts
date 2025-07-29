import api from './api';
import { ApiResponse } from '../types/auth';
import { User, UserNicknameUpdate, UserPasswordUpdate } from '../types/user';

class UserService {
  // 내 정보 조회
  async getMyProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data.data;
  }

  // 닉네임 변경
  async updateNickname(data: UserNicknameUpdate): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/users/profile/updateNickname', data);
    return response.data.data;
  }

  // 비밀번호 변경
  async updatePassword(data: UserPasswordUpdate): Promise<void> {
    await api.patch<ApiResponse<void>>('/users/profile/updatePassword', data);
  }
}

export const userService = new UserService();
export default userService;