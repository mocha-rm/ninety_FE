import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google Sign-In 설정
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // TODO: 실제 Google Web Client ID로 변경 필요
    webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

// 구글 로그인 실행
export const signInWithGoogle = async () => {
  try {
    // Google Play Services 확인
    await GoogleSignin.hasPlayServices();
    
    // 구글 로그인 실행
    const userInfo = await GoogleSignin.signIn();
    
    return {
      success: true,
      userInfo,
    };
  } catch (error: any) {
    if (error.code === 'SIGN_IN_CANCELLED') {
      return {
        success: false,
        error: '사용자가 로그인을 취소했습니다.',
        code: 'CANCELLED',
      };
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      return {
        success: false,
        error: 'Google Play Services를 사용할 수 없습니다.',
        code: 'PLAY_SERVICES_ERROR',
      };
    } else {
      return {
        success: false,
        error: '구글 로그인 중 오류가 발생했습니다.',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }
  }
};

// 구글 로그아웃
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: '구글 로그아웃 중 오류가 발생했습니다.',
      details: error,
    };
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return { success: true, userInfo };
  } catch (error) {
    return {
      success: false,
      error: '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      details: error,
    };
  }
}; 