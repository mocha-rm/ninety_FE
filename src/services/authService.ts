import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserJwtResponse } from '../types/auth';

class AuthService {
  // 회원가입
  async signUp(data: any): Promise<UserJwtResponse> {
    const response = await api.post<any>('/signup', data);
    return response.data.data;
  }

  // 이메일/비밀번호 로그인
  async login(data: any): Promise<UserJwtResponse> {
    const response = await api.post<any>('/login', data);
    const userData = response.data.data;
    
    // 토큰 저장
    await AsyncStorage.setItem('accessToken', userData.accessToken);
    await AsyncStorage.setItem('refreshToken', userData.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  }

  // 구글 OAuth2 로그인
  async googleLogin(data: any): Promise<UserJwtResponse> {
    const response = await api.post<UserJwtResponse>('/oauth2/google', data);
    const userData = response.data;
    
    // 토큰 저장
    await AsyncStorage.setItem('accessToken', userData.accessToken);
    await AsyncStorage.setItem('refreshToken', userData.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // 로컬 저장소에서 토큰 제거
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  }

  // 저장된 사용자 정보 가져오기
  async getStoredUser(): Promise<UserJwtResponse | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // 토큰 유효성 확인
  async isTokenValid(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // 자동 로그인 체크
  async checkAutoLogin(): Promise<UserJwtResponse | null> {
    const user = await this.getStoredUser();
    const isValid = await this.isTokenValid();
    
    if (user && isValid) {
      return user;
    }
    
    // 토큰이 유효하지 않으면 저장된 데이터 삭제
    if (!isValid) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
    
    return null;
  }
}

export const authService = new AuthService();
export default authService; 