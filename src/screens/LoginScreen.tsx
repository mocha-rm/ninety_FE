import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('로그인 실패', error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
      isValid = false;
    }

    return isValid;
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Ninety</Text>
          <Text style={styles.subtitle}>90-Day Challenge • 당신의 습관을 바꿔보세요</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="이메일"
            placeholder="이메일을 입력하세요"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <CustomInput
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
          />

          <CustomButton
            title="로그인"
            onPress={handleEmailLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title="테스트 로그인 (개발용)"
            onPress={() => {
              Alert.alert('테스트', '테스트 로그인 기능입니다.');
            }}
            variant="outline"
            style={styles.googleButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            계정이 없으신가요?{' '}
            <TouchableOpacity onPress={handleSignUpPress}>
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8f9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9a4c66',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  loginButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7cfd7',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9a4c66',
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9a4c66',
  },
  linkText: {
    color: '#ed2a6b',
    fontWeight: '600',
  },
});

export default LoginScreen; 