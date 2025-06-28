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

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signUp, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickName, setNickName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [nickNameError, setNickNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('회원가입 실패', error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    let isValid = true;
    
    // 이메일 검증
    setEmailError('');
    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      isValid = false;
    }

    // 비밀번호 검증
    setPasswordError('');
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
      isValid = false;
    }

    // 비밀번호 확인 검증
    setConfirmPasswordError('');
    if (!confirmPassword) {
      setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      isValid = false;
    }

    // 이름 검증
    setNameError('');
    if (!name) {
      setNameError('이름을 입력해주세요.');
      isValid = false;
    } else if (name.length < 2) {
      setNameError('이름은 2자 이상이어야 합니다.');
      isValid = false;
    }

    // 닉네임 검증
    setNickNameError('');
    if (!nickName) {
      setNickNameError('닉네임을 입력해주세요.');
      isValid = false;
    } else if (nickName.length < 2) {
      setNickNameError('닉네임은 2자 이상이어야 합니다.');
      isValid = false;
    }

    // 전화번호 검증 (선택사항이므로 빈 값이어도 OK)
    setPhoneNumberError('');
    if (phoneNumber && !/^[0-9-+\s()]+$/.test(phoneNumber)) {
      setPhoneNumberError('올바른 전화번호 형식을 입력해주세요.');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp(email, password, name, nickName, phoneNumber);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
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
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>90-Day Challenge에 참여하세요</Text>
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
            placeholder="비밀번호를 입력하세요 (6자 이상)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
          />

          <CustomInput
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPasswordError}
          />

          <CustomInput
            label="이름"
            placeholder="이름을 입력하세요"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={nameError}
          />

          <CustomInput
            label="닉네임"
            placeholder="닉네임을 입력하세요"
            value={nickName}
            onChangeText={setNickName}
            autoCapitalize="words"
            error={nickNameError}
          />

          <CustomInput
            label="전화번호 (선택사항)"
            placeholder="전화번호를 입력하세요"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            error={phoneNumberError}
          />

          <CustomButton
            title="회원가입"
            onPress={handleSignUp}
            loading={isLoading}
            style={styles.signUpButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            이미 계정이 있으신가요?{' '}
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={styles.linkText}>로그인</Text>
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
    marginBottom: 32,
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
  signUpButton: {
    marginTop: 24,
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

export default SignUpScreen; 