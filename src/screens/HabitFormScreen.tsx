import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Logo from '../components/Logo';
import habitService, { Habit, CreateHabitRequest, UpdateHabitRequest } from '../services/habitService';

interface HabitFormScreenProps {
  route?: {
    params?: {
      habit?: Habit;
      isEdit?: boolean;
    };
  };
  navigation?: any;
}

const HabitFormScreen: React.FC<HabitFormScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const habit = route?.params?.habit;
  const isEdit = route?.params?.isEdit || false;
  
  const [title, setTitle] = useState(habit?.title || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [startAt, setStartAt] = useState(habit?.startAt || new Date().toISOString().split('T')[0]);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(habit?.isAlarmEnabled || false);
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || '09:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(habit?.repeatDays || []);
  const [loading, setLoading] = useState(false);

  const dayOptions = [
    { value: 'MONDAY', label: '월', emoji: '🌅' },
    { value: 'TUESDAY', label: '화', emoji: '☀️' },
    { value: 'WEDNESDAY', label: '수', emoji: '🌤️' },
    { value: 'THURSDAY', label: '목', emoji: '🌥️' },
    { value: 'FRIDAY', label: '금', emoji: '🌆' },
    { value: 'SATURDAY', label: '토', emoji: '🌙' },
    { value: 'SUNDAY', label: '일', emoji: '⭐' },
  ];

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '습관 제목을 입력해주세요.');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('오류', '최소 하나의 요일을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit && habit) {
        const updateData: UpdateHabitRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          startAt,
          repeatDays: selectedDays,
          isAlarmEnabled,
          reminderTime: isAlarmEnabled ? reminderTime : undefined,
        };
        
        await habitService.updateHabit(habit.id, updateData);
        Alert.alert('성공', '습관이 수정되었습니다.', [
          { text: '확인', onPress: () => navigation?.goBack() }
        ]);
      } else {
        const createData: CreateHabitRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          startAt,
          repeatDays: selectedDays,
          isAlarmEnabled,
          reminderTime: isAlarmEnabled ? reminderTime : undefined,
        };
        
        await habitService.createHabit(createData);
        Alert.alert('성공', '새 습관이 생성되었습니다.', [
          { text: '확인', onPress: () => navigation?.goBack() }
        ]);
      }
    } catch (error) {
      console.error('습관 저장 실패:', error);
      Alert.alert('오류', '습관 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!isEdit || !habit) return;

    Alert.alert(
      '습관 삭제',
      '정말 이 습관을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await habitService.deleteHabit(habit.id);
              Alert.alert('성공', '습관이 삭제되었습니다.', [
                { text: '확인', onPress: () => navigation?.goBack() }
              ]);
            } catch (error) {
              console.error('습관 삭제 실패:', error);
              Alert.alert('오류', '습관 삭제에 실패했습니다.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>
          {isEdit ? '습관 수정' : '새 습관 만들기'}
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          
          <CustomInput
            placeholder="습관 제목"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          
          <CustomInput
            placeholder="설명 (선택사항)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <CustomInput
            placeholder="시작일 (YYYY-MM-DD)"
            value={startAt}
            onChangeText={setStartAt}
            style={styles.input}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>반복 요일</Text>
          <View style={styles.daysContainer}>
            {dayOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dayButton,
                  selectedDays.includes(option.value) && styles.selectedDayButton,
                ]}
                onPress={() => handleDayToggle(option.value)}
              >
                <Text style={styles.dayEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.dayText,
                  selectedDays.includes(option.value) && styles.selectedDayText,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          
          <View style={styles.alarmRow}>
            <Text style={styles.alarmLabel}>알림 활성화</Text>
            <Switch
              value={isAlarmEnabled}
              onValueChange={setIsAlarmEnabled}
              trackColor={{ false: '#e7cfd7', true: '#6366F1' }}
              thumbColor={isAlarmEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {isAlarmEnabled && (
            <CustomInput
              placeholder="알림 시간 (HH:MM)"
              value={reminderTime}
              onChangeText={setReminderTime}
              style={styles.input}
            />
          )}
        </View>

        <View style={styles.actionSection}>
          <CustomButton
            title={isEdit ? '수정하기' : '습관 만들기'}
            onPress={handleSave}
            style={styles.saveButton}
            disabled={loading}
          />
          
          {isEdit && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>습관 삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8f9',
  },
  content: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b0d12',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b0d12',
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    marginBottom: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDayButton: {
    borderColor: '#6366F1',
    backgroundColor: '#f3f4f6',
  },
  dayEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedDayText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  alarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
  },
  alarmLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1b0d12',
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  saveButton: {
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
});

export default HabitFormScreen; 