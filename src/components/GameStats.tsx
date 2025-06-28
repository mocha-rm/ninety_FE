import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGame } from '../contexts/GameContext';

interface GameStatsProps {
  style?: any;
}

const GameStats: React.FC<GameStatsProps> = ({ style }) => {
  const { userGameData, loading } = useGame();

  if (loading || !userGameData) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>게임 데이터 로딩 중...</Text>
      </View>
    );
  }

  const experienceToNext = userGameData.level * 100 - userGameData.experience;
  const progressPercentage = ((userGameData.experience % 100) / 100) * 100;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>💰 코인</Text>
          <Text style={styles.statValue}>{userGameData.coins}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>⭐ 레벨</Text>
          <Text style={styles.statValue}>{userGameData.level}</Text>
        </View>
      </View>

      <View style={styles.experienceContainer}>
        <Text style={styles.experienceLabel}>
          경험치: {userGameData.experience} / {userGameData.level * 100}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.nextLevelText}>
          다음 레벨까지 {experienceToNext} 경험치 필요
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b0d12',
  },
  experienceContainer: {
    marginTop: 8,
  },
  experienceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e7cfd7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default GameStats; 