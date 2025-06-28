import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import CustomButton from '../components/CustomButton';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const habits = [
    {
      id: 1,
      title: 'Drink 1L of water',
      time: 'Morning',
      icon: '💧',
      completed: false,
    },
    {
      id: 2,
      title: 'Meditate for 10 minutes',
      time: 'Morning',
      icon: '🙏',
      completed: false,
    },
    {
      id: 3,
      title: 'Read for 30 minutes',
      time: 'Morning',
      icon: '📚',
      completed: false,
    },
    {
      id: 4,
      title: 'Journal for 15 minutes',
      time: 'Evening',
      icon: '✏️',
      completed: false,
    },
    {
      id: 5,
      title: 'Plan tomorrow\'s tasks',
      time: 'Evening',
      icon: '📋',
      completed: false,
    },
    {
      id: 6,
      title: 'Sleep before 11 PM',
      time: 'Evening',
      icon: '🌙',
      completed: false,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>90-Day Challenge</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>
          안녕하세요, {user?.name || '사용자'}님!
        </Text>
        <Text style={styles.subtitle}>오늘의 습관을 완료해보세요</Text>
      </View>

      <Text style={styles.sectionTitle}>Habits</Text>

      <ScrollView style={styles.habitsContainer} showsVerticalScrollIndicator={false}>
        {habits.map((habit) => (
          <View key={habit.id} style={styles.habitItem}>
            <View style={styles.habitLeft}>
              <View style={styles.habitIcon}>
                <Text style={styles.iconText}>{habit.icon}</Text>
              </View>
              <View style={styles.habitInfo}>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <Text style={styles.habitTime}>{habit.time}</Text>
              </View>
            </View>
            <View style={styles.habitRight}>
              <TouchableOpacity style={styles.checkbox}>
                <Text style={styles.checkboxText}>
                  {habit.completed ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.addButtonContainer}>
          <CustomButton
            title="Add Habit"
            onPress={() => console.log('Add habit')}
            style={styles.addButton}
          />
        </View>

        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏆</Text>
            <Text style={styles.navText}>Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🎁</Text>
            <Text style={styles.navText}>Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  headerLeft: {
    width: 48,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1b0d12',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0d12',
    textAlign: 'center',
  },
  headerRight: {
    width: 48,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    fontSize: 12,
    color: '#ed2a6b',
    fontWeight: '600',
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
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 72,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#9a4c66',
  },
  habitRight: {
    width: 28,
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e7cfd7',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 12,
    color: '#ed2a6b',
    fontWeight: 'bold',
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
  bottomNavigation: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3e7eb',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  navText: {
    fontSize: 12,
    color: '#9a4c66',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#1b0d12',
  },
});

export default HomeScreen; 