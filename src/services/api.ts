import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 개발 환경에 따른 BASE_URL 설정
const getBaseUrl = () => {
  if (__DEV__) {
    // 실제 기기에서 테스트할 때는 컴퓨터의 IP 주소를 사용해야 합니다
    return 'http://204.218.7.21:8080'; // 실제 컴퓨터 IP 주소
    
    // 시뮬레이터에서만 사용할 수 있는 localhost
    // return 'http://localhost:8080';
  }
  
  // 프로덕션 환경에서는 실제 서버 URL 사용
  return 'https://your-production-server.com';
};

const BASE_URL = getBaseUrl();

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

    // 디버깅을 위한 로그
    console.log('API Service initialized with BASE_URL:', BASE_URL);

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('Response Error:', error.response?.status, error.response?.data);
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

  // API 연결 테스트 함수
  public async testConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection to:', BASE_URL);
      const response = await this.api.get('/api/health'); // 또는 다른 간단한 엔드포인트
      console.log('Connection test successful:', response.status);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService.getInstance(); 