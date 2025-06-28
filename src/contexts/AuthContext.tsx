import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, UserJwtResponse } from '../types/auth';
import authService from '../services/authService';
import { apiService } from '../services/api';
import { Alert } from 'react-native';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name: string, nickName: string, phoneNumber: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: UserJwtResponse }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'AUTO_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTO_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: '서버 연결이 끊어져 자동으로 로그아웃되었습니다. 다시 로그인해주세요.',
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // API 서비스에 로그아웃 콜백 등록
    apiService.setLogoutCallback(() => {
      console.log('Auto logout callback triggered');
      
      // 자동 로그아웃 알림 표시
      Alert.alert(
        '자동 로그아웃',
        '서버 연결이 끊어져 자동으로 로그아웃되었습니다.\n다시 로그인해주세요.',
        [{ text: '확인' }]
      );
      
      dispatch({ type: 'AUTO_LOGOUT' });
    });

    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const user = await authService.checkAutoLogin();
      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }
    } catch (error) {
      console.error('Auto login check failed:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: '자동 로그인 실패' });
    }
  };

  const signUp = async (email: string, password: string, name: string, nickName: string, phoneNumber: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authService.signUp({ email, password, name, nickName, phoneNumber });
      // 회원가입 후 자동 로그인
      await login(email, password);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authService.login({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  };

  const googleLogin = async (idToken: string, accessToken: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await authService.googleLogin({ idToken, accessToken });
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '구글 로그인에 실패했습니다.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    login,
    googleLogin,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 