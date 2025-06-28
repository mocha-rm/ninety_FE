import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo 개발 환경에서는 localhost를 사용할 수 있습니다
const BASE_URL = 'http://localhost:8080'; // 스프링 백엔드 서버 주소

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken } = response.data;
              
              await AsyncStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token도 만료된 경우 로그아웃 처리
            await this.logout();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async logout() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    // 로그인 화면으로 리다이렉트 로직 추가 필요
  }

  private async refreshToken(refreshToken: string) {
    return this.api.post('/api/auth/refresh', { refreshToken });
  }

  public getInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export default apiService.getInstance(); 