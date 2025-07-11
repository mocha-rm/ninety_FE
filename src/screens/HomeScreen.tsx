import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import CustomButton from '../components/CustomButton';
import Logo from '../components/Logo';
import GameStats from '../components/GameStats';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import habitService, { Habit, HabitsPageResponse } from '../services/habitService';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { earnCoins, earnExperience } = useGame();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [completingHabits, setCompletingHabits] = useState<Set<number>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const loadHabits = async (page: number = 0) => {
    try {
      setLoading(true);
      const response = await habitService.getHabits(page, 20);
      if (page === 0) {
        setHabits(response.content);
      } else {
        setHabits(prev => [...prev, ...response.content]);
      }
      setCurrentPage(response.number);
      setHasMore(!response.last);
    } catch (error: any) {
      console.error('습관 로드 실패:', error);
      
      // 401/404 에러의 경우 자동 로그아웃이 처리되므로 별도 알림 불필요
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        Alert.alert('오류', '습관 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadHabits(currentPage + 1);
    }
  };

  const handleAddHabit = () => {
    navigation.navigate('HabitForm');
  };

  const handleEditHabit = (habit: Habit) => {
    navigation.navigate('HabitForm', { habit, isEdit: true });
  };

  const handleCompleteHabit = async (habit: Habit) => {
    if (completingHabits.has(habit.id)) return;

    try {
      setCompletingHabits(prev => new Set(prev).add(habit.id));
      
      // 습관 완료 처리
      await habitService.completeHabit(habit.id);
      
      // 게임 보상 지급
      await earnCoins(10); // 습관 완료시 10코인
      await earnExperience(20); // 습관 완료시 20경험치
      
      Alert.alert(
        '🎉 습관 완료!',
        `축하합니다!\n💰 +10 코인\n⭐ +20 경험치`,
        [{ text: '확인' }]
      );
      
      // 습관 목록 새로고침
      loadHabits(0);
    } catch (error: any) {
      console.error('습관 완료 실패:', error);
      Alert.alert('오류', '습관 완료에 실패했습니다.');
    } finally {
      setCompletingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habit.id);
        return newSet;
      });
    }
  };

  const getRepeatDaysLabel = (repeatDays: string[]) => {
    return habitService.getRepeatDaysLabel(repeatDays);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading && habits.length === 0) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Logo size={32} />
          <Text style={styles.headerTitle}>Ninety</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>
          안녕하세요, {user?.name || '사용자'}님!
        </Text>
        <Text style={styles.subtitle}>오늘의 습관을 확인해보세요</Text>
      </View>

      <GameStats />

      <Text style={styles.sectionTitle}>습관 목록</Text>

      <ScrollView 
        style={styles.habitsContainer} 
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>아직 등록된 습관이 없습니다.</Text>
            <Text style={styles.emptyStateSubtext}>새로운 습관을 만들어보세요!</Text>
          </View>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={styles.habitItem}>
              <View style={styles.habitLeft}>
                <View style={styles.habitIcon}>
                  <Text style={styles.iconText}>📋</Text>
                </View>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitTime}>
                    {getRepeatDaysLabel(habit.repeatDays)}
                  </Text>
                  {habit.description && (
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                  )}
                  <Text style={styles.habitDate}>
                    시작일: {formatDate(habit.startAt)}
                  </Text>
                  {habit.isAlarmEnabled && habit.reminderTime && (
                    <Text style={styles.habitAlarm}>
                      알림: {habit.reminderTime}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.habitRight}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditHabit(habit)}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    completingHabits.has(habit.id) && styles.completingButton
                  ]}
                  onPress={() => handleCompleteHabit(habit)}
                  disabled={completingHabits.has(habit.id)}
                >
                  <Text style={styles.completeButtonText}>
                    {completingHabits.has(habit.id) ? '완료 중...' : '✅'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        
        {loading && habits.length > 0 && (
          <View style={styles.loadingMore}>
            <Text style={styles.loadingMoreText}>더 불러오는 중...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.addButtonContainer}>
          <CustomButton
            title="습관 추가"
            onPress={handleAddHabit}
            style={styles.addButton}
          />
        </View>
      </View>
    </SafeAreaWrapper>
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
  userInfo: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9a4c66',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b0d12',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 20,
  },
  habitsContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9a4c66',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9a4c66',
    textAlign: 'center',
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b0d12',
    marginBottom: 4,
  },
  habitTime: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 12,
    color: '#9a4c66',
    opacity: 0.8,
    marginBottom: 2,
  },
  habitDate: {
    fontSize: 12,
    color: '#9a4c66',
    marginBottom: 2,
  },
  habitAlarm: {
    fontSize: 12,
    color: '#ed2a6b',
    fontWeight: '500',
  },
  habitRight: {
    alignItems: 'center',
  },
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#9a4c66',
  },
  bottomSection: {
    backgroundColor: '#fcf8f9',
  },
  addButtonContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  addButton: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 120,
  },
  completeButton: {
    padding: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginTop: 8,
  },
  completingButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 