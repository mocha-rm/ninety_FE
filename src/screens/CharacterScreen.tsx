import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useGame } from '../contexts/GameContext';
import { useCharacter } from '../contexts/CharacterContext'; // CharacterContext import
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { Character, UserCharacter, CharacterRarity } from '../types/character';
import characterService from '../services/characterService';
import userCharacterService from '../services/userCharacterService';
import { useFocusEffect } from '@react-navigation/native';

const CharacterScreen: React.FC = () => {
  const { userGameData, refreshGameData } = useGame();
  const { 
    userCharacters, 
    activeCharacter, 
    loading, 
    refreshCharacters, 
    updateUserCharacterStatus, 
    feedCharacter, 
    playWithCharacter 
  } = useCharacter(); // CharacterContext 사용

  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [selectedUserCharacter, setSelectedUserCharacter] = useState<UserCharacter | null>(null);
  const [newNickname, setNewNickname] = useState('');

  // 헬퍼 함수들
  const getRarityColor = (rarity: CharacterRarity) => {
    switch (rarity) {
      case CharacterRarity.COMMON: return '#A8A8A8';
      case CharacterRarity.RARE: return '#64B5F6';
      case CharacterRarity.EPIC: return '#9C27B0';
      case CharacterRarity.LEGENDARY: return '#FFD700';
      default: return '#000000';
    }
  };

  const getRarityLabel = (rarity: CharacterRarity) => {
    switch (rarity) {
      case CharacterRarity.COMMON: return '일반';
      case CharacterRarity.RARE: return '희귀';
      case CharacterRarity.EPIC: return '영웅';
      case CharacterRarity.LEGENDARY: return '전설';
      default: return '알 수 없음';
    }
  };

  const getHappinessStatus = (happiness: number) => {
    if (happiness >= 80) return { label: '매우 행복', color: '#4CAF50' };
    if (happiness >= 50) return { label: '행복', color: '#FFC107' };
    if (happiness >= 20) return { label: '보통', color: '#FF9800' };
    return { label: '불행', color: '#F44336' };
  };

  const handleFeedCharacter = async (userCharacter: UserCharacter) => {
    const success = await feedCharacter(userCharacter.id);
    if (success) {
      Alert.alert('성공', `${userCharacter.nickname || userCharacter.character.name}에게 먹이를 주었습니다!`);
      refreshGameData(); // 음식 아이템 감소 반영
    }
  };

  const handlePlayWithCharacter = async (userCharacter: UserCharacter) => {
    const success = await playWithCharacter(userCharacter.id);
    if (success) {
      Alert.alert('성공', `${userCharacter.nickname || userCharacter.character.name}와(과) 즐겁게 놀았습니다!`);
      refreshGameData(); // 장난감 아이템 감소 반영
    }
  };

  const handleSetActiveCharacter = async (userCharacter: UserCharacter) => {
    if (userCharacter.isActive) return;

    Alert.alert(
      '활성 캐릭터 설정',
      `${userCharacter.nickname || userCharacter.character.name}을(를) 활성 캐릭터로 설정하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '설정',
          onPress: async () => {
            const success = await updateUserCharacterStatus(userCharacter.id, true);
            if (success) {
              Alert.alert('성공', '활성 캐릭터가 변경되었습니다!');
            }
          },
        },
      ]
    );
  };

  const handleOpenNicknameModal = (userCharacter: UserCharacter) => {
    setSelectedUserCharacter(userCharacter);
    setNewNickname(userCharacter.nickname || userCharacter.character.name);
    setNicknameModalVisible(true);
  };

  const handleUpdateNickname = async () => {
    if (!selectedUserCharacter) return;

    const success = await updateUserCharacterStatus(selectedUserCharacter.id, selectedUserCharacter.isActive, newNickname.trim());
    if (success) {
      Alert.alert('성공', '닉네임이 변경되었습니다!');
      setNicknameModalVisible(false);
    }
  };

  const renderUserCharacterCard = (userCharacter: UserCharacter) => {
    // character가 없을 경우를 대비한 방어 코드
    if (!userCharacter.character) {
      return (
        <View key={userCharacter.id} style={styles.characterCard}>
          <ActivityIndicator />
        </View>
      );
    }

    const happinessStatus = getHappinessStatus(userCharacter.happiness);
    const rarityColor = getRarityColor(userCharacter.character.rarity);
    const rarityLabel = getRarityLabel(userCharacter.character.rarity);

    return (
      <View key={userCharacter.id} style={styles.characterCard}>
        <View style={styles.characterHeader}>
          <Image source={{ uri: userCharacter.character.imageUrl || 'https://via.placeholder.com/60' }} style={styles.characterImage} />
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>
              {userCharacter.nickname || userCharacter.character.name}
            </Text>
            <Text style={styles.characterOriginalName}>
              {userCharacter.character.name}
            </Text>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityText}>{rarityLabel}</Text>
            </View>
          </View>
          {userCharacter.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>장착중</Text>
            </View>
          )}
        </View>

        <View style={styles.characterStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>레벨</Text>
            <Text style={styles.statValue}>{userCharacter.level}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>경험치</Text>
            <Text style={styles.statValue}>{userCharacter.experience}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>행복도</Text>
            <Text style={[styles.statValue, { color: happinessStatus.color }]}>
              {userCharacter.happiness}%
            </Text>
          </View>
        </View>

        <View style={styles.characterActions}>
          {!userCharacter.isActive && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetActiveCharacter(userCharacter)}
            >
              <Text style={styles.actionButtonText}>장착하기</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleFeedCharacter(userCharacter)}
          >
            <Text style={styles.actionButtonText}>먹이주기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePlayWithCharacter(userCharacter)}
          >
            <Text style={styles.actionButtonText}>놀아주기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenNicknameModal(userCharacter)}
          >
            <Text style={styles.actionButtonText}>닉네임 변경</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>캐릭터를 불러오는 중...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <Image source={{ uri: activeCharacter?.character?.imageUrl || 'https://via.placeholder.com/60' }} style={styles.characterImage} />
        {userGameData && (
          <View style={styles.coinDisplay}>
            <Text style={styles.coinText}>💰 {userGameData.coins} 코인</Text>
          </View>
        )}
      </View>

      {/* 활성 캐릭터 표시 */}
      {activeCharacter && (
        <View style={styles.activeCharacterSection}>
          <Text style={styles.sectionTitle}>현재 파트너</Text>
          {renderUserCharacterCard(activeCharacter)}
        </View>
      )}

      {/* 보유 캐릭터 목록 */}
      <View style={styles.charactersSection}>
        <Text style={styles.sectionTitle}>보유 캐릭터</Text>
        <ScrollView style={styles.charactersList} showsVerticalScrollIndicator={false}>
          {userCharacters.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>아직 캐릭터가 없습니다.</Text>
              <Text style={styles.emptyStateSubtext}>상점에서 캐릭터를 구매해보세요!</Text>
            </View>
          ) : (
            userCharacters
              .filter(char => !char.isActive)
              .map(renderUserCharacterCard)
          )}
        </ScrollView>
      </View>

      {/* 캐릭터 상점 섹션 제거 */}

      {/* 닉네임 변경 모달 */}
      <Modal
        visible={nicknameModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNicknameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>닉네임 변경</Text>
            <Text style={styles.modalSubtitle}>캐릭터의 새로운 닉네임을 입력해주세요.</Text>
            <TextInput
              style={styles.nicknameInput}
              placeholder="새 닉네임"
              value={newNickname}
              onChangeText={setNewNickname}
              maxLength={10}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setNicknameModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleUpdateNickname}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  변경하기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8f9',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fcf8f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b0d12',
  },
  coinDisplay: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  activeCharacterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 12,
  },
  characterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  characterImage: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 2,
  },
  characterOriginalName: {
    fontSize: 12,
    color: '#9a4c66',
    marginBottom: 4,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  characterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0d12',
  },
  characterActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    margin: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  charactersSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  charactersList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9a4c66',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9a4c66',
    textAlign: 'center',
  },
  shopSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shopList: {
    flexGrow: 0,
  },
  shopItem: {
    width: 120,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b0d12',
    textAlign: 'center',
    marginBottom: 4,
  },
  shopItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 4,
  },
  shopItemDescription: {
    fontSize: 10,
    color: '#9a4c66',
    textAlign: 'center',
    marginBottom: 8,
  },
  purchaseText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0d12',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9a4c66',
    textAlign: 'center',
    marginBottom: 16,
  },
  nicknameInput: {
    borderWidth: 1,
    borderColor: '#e7cfd7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#6366F1',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9a4c66',
  },
  modalButtonTextPrimary: {
    color: 'white',
  },
  emptyShopState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
});

export default CharacterScreen;
