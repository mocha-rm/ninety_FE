import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Logo from '../components/Logo';
import userService, { UserProfileResponse, UpdateNicknameRequest, UpdatePasswordRequest } from '../services/userService';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userService.getMyProfile();
      setProfile(userProfile);
    } catch (error: any) {
      console.error('프로필 로드 실패:', error);
      
      // 401/404 에러의 경우 자동 로그아웃이 처리되므로 별도 알림 불필요
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNickname = async () => {
    if (!newNickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }

    try {
      const updatedProfile = await userService.updateNickname({ nickName: newNickname.trim() });
      setProfile(updatedProfile);
      setNicknameModalVisible(false);
      setNewNickname('');
      Alert.alert('성공', '닉네임이 변경되었습니다.');
    } catch (error) {
      console.error('닉네임 변경 실패:', error);
      Alert.alert('오류', '닉네임 변경에 실패했습니다.');
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      await userService.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('성공', '비밀번호가 변경되었습니다.');
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      Alert.alert('오류', '비밀번호 변경에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('로그아웃 오류:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount();
              await logout();
            } catch (error) {
              console.error('계정 삭제 오류:', error);
              Alert.alert('오류', '계정 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Logo size={32} />
          <Text style={styles.headerTitle}>Ninety</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>
              {profile?.nickName?.charAt(0) || user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.nickName || user?.name || '사용자'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setNicknameModalVisible(true)}
          >
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuTitle}>닉네임 변경</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuTitle}>비밀번호 변경</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionSection}>
          <CustomButton
            title="로그아웃"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>계정 삭제</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 닉네임 변경 모달 */}
      <Modal
        visible={nicknameModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNicknameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>닉네임 변경</Text>
            <CustomInput
              placeholder="새 닉네임"
              value={newNickname}
              onChangeText={setNewNickname}
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <CustomButton
                title="취소"
                onPress={() => {
                  setNicknameModalVisible(false);
                  setNewNickname('');
                }}
                style={styles.cancelButton}
              />
              <CustomButton
                title="변경"
                onPress={handleUpdateNickname}
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 비밀번호 변경 모달 */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>
            <CustomInput
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.modalInput}
            />
            <CustomInput
              placeholder="새 비밀번호"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.modalInput}
            />
            <CustomInput
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <CustomButton
                title="취소"
                onPress={() => {
                  setPasswordModalVisible(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={styles.cancelButton}
              />
              <CustomButton
                title="변경"
                onPress={handleUpdatePassword}
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fcf8f9',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginLeft: 8,
  },
  headerRight: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9a4c66',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#9a4c66',
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1b0d12',
  },
  menuArrow: {
    fontSize: 16,
    color: '#9a4c66',
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#ed2a6b',
    marginBottom: 12,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#9ca3af',
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ProfileScreen; 