import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 개발 환경에 따른 BASE_URL 설정
const getBaseUrl = () => {
  if (__DEV__) {
    // 시뮬레이터에서만 사용할 수 있는 localhost
    return 'http://172.30.1.31:8080/api';
  }
  
  // 프로덕션 환경에서는 실제 서버 URL 사용
  return 'https://your-production-server.com/api';
};

const BASE_URL = getBaseUrl();

// AuthContext와의 연동을 위한 콜백 함수 타입
type LogoutCallback = () => void;

class ApiService {
  private api: AxiosInstance;
  private logoutCallback: LogoutCallback | null = null;

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

  // AuthContext에서 로그아웃 콜백 등록
  public setLogoutCallback(callback: LogoutCallback) {
    this.logoutCallback = callback;
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

        // 401 Unauthorized 또는 404 Not Found 에러 처리
        if ((error.response?.status === 401 || error.response?.status === 404) && !originalRequest._retry) {
          originalRequest._retry = true;

          // 401 에러의 경우 토큰 갱신 시도
          if (error.response?.status === 401) {
            // try {
            //   const refreshToken = await AsyncStorage.getItem('refreshToken');
            //   if (refreshToken) {
            //     const response = await this.refreshToken(refreshToken);
            //     const { accessToken } = response.data;
            //     
            //     await AsyncStorage.setItem('accessToken', accessToken);
            //     originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            //     
            //     return this.api(originalRequest);
            //   }
            // } catch (refreshError) {
            //   console.error('Token refresh failed:', refreshError);
            // }
          }

          // 토큰 갱신 실패 또는 404 에러의 경우 자동 로그아웃
          await this.handleAutoLogout();
        }

        return Promise.reject(error);
      }
    );
  }

  private async handleAutoLogout() {
    console.log('Auto logout triggered due to authentication error');
    
    // 로컬 저장소 정리
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    
    // AuthContext의 로그아웃 콜백 호출
    if (this.logoutCallback) {
      this.logoutCallback();
    }
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
      const response = await this.api.get('/'); // 또는 다른 간단한 엔드포인트
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