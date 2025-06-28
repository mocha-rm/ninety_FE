import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useCharacter } from '../contexts/CharacterContext';
import { useGame } from '../contexts/GameContext';
import { UserCharacter } from '../types/character';
import characterService from '../services/characterService';

const CharacterScreen: React.FC = () => {
  const { 
    characterShop, 
    userCharacters, 
    activeCharacter, 
    loading,
    purchaseCharacter,
    adoptCharacter,
    feedCharacter,
    playWithCharacter,
    setActiveCharacter
  } = useCharacter();
  const { userGameData } = useGame();
  const [adoptModalVisible, setAdoptModalVisible] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [nickname, setNickname] = useState('');
  const [purchasingCharacters, setPurchasingCharacters] = useState<Set<number>>(new Set());

  const handlePurchaseCharacter = async (characterId: number) => {
    if (!userGameData) {
      Alert.alert('오류', '게임 데이터를 불러올 수 없습니다.');
      return;
    }

    const character = characterShop.find(c => c.id === characterId);
    if (!character) return;

    if (character.isOwned) {
      Alert.alert('알림', '이미 소유한 캐릭터입니다.');
      return;
    }

    if (userGameData.coins < character.price) {
      Alert.alert('코인 부족', '코인이 부족합니다. 습관을 완료해서 코인을 모아보세요!');
      return;
    }

    Alert.alert(
      '캐릭터 구매',
      `${character.name}을(를) ${character.price}코인에 구매하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '구매',
          onPress: async () => {
            try {
              setPurchasingCharacters(prev => new Set(prev).add(characterId));
              const success = await purchaseCharacter(characterId);
              
              if (success) {
                Alert.alert('구매 완료', `${character.name}을(를) 구매했습니다!`);
                setAdoptModalVisible(true);
                setSelectedCharacterId(characterId);
              } else {
                Alert.alert('구매 실패', '캐릭터 구매에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '구매 중 오류가 발생했습니다.');
            } finally {
              setPurchasingCharacters(prev => {
                const newSet = new Set(prev);
                newSet.delete(characterId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleAdoptCharacter = async () => {
    if (!selectedCharacterId) return;

    try {
      const success = await adoptCharacter(selectedCharacterId, nickname.trim() || undefined);
      
      if (success) {
        Alert.alert('입양 완료', '캐릭터를 입양했습니다!');
        setAdoptModalVisible(false);
        setSelectedCharacterId(null);
        setNickname('');
      } else {
        Alert.alert('입양 실패', '캐릭터 입양에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '입양 중 오류가 발생했습니다.');
    }
  };

  const handleFeedCharacter = async (character: UserCharacter) => {
    Alert.alert(
      '먹이 주기',
      '어떤 먹이를 주시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '기본 먹이 (무료)',
          onPress: async () => {
            const success = await feedCharacter(character.id, 'basic');
            if (success) {
              Alert.alert('성공', '캐릭터가 행복해졌습니다!');
            }
          },
        },
        {
          text: '프리미엄 먹이 (10코인)',
          onPress: async () => {
            if (userGameData && userGameData.coins < 10) {
              Alert.alert('코인 부족', '코인이 부족합니다.');
              return;
            }
            const success = await feedCharacter(character.id, 'premium');
            if (success) {
              Alert.alert('성공', '캐릭터가 매우 행복해졌습니다!');
            }
          },
        },
      ]
    );
  };

  const handlePlayWithCharacter = async (character: UserCharacter) => {
    Alert.alert(
      '놀아주기',
      '어떤 활동을 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '쓰다듬기',
          onPress: async () => {
            const success = await playWithCharacter(character.id, 'pet');
            if (success) {
              Alert.alert('성공', '캐릭터가 좋아합니다!');
            }
          },
        },
        {
          text: '놀아주기',
          onPress: async () => {
            const success = await playWithCharacter(character.id, 'play');
            if (success) {
              Alert.alert('성공', '캐릭터와 즐거운 시간을 보냈습니다!');
            }
          },
        },
        {
          text: '산책하기',
          onPress: async () => {
            const success = await playWithCharacter(character.id, 'walk');
            if (success) {
              Alert.alert('성공', '캐릭터와 산책을 즐겼습니다!');
            }
          },
        },
      ]
    );
  };

  const handleSetActiveCharacter = async (character: UserCharacter) => {
    if (character.isActive) return;

    Alert.alert(
      '활성 캐릭터 설정',
      `${character.nickname || character.character.name}을(를) 활성 캐릭터로 설정하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '설정',
          onPress: async () => {
            const success = await setActiveCharacter(character.id);
            if (success) {
              Alert.alert('성공', '활성 캐릭터가 변경되었습니다!');
            }
          },
        },
      ]
    );
  };

  const getRarityColor = (rarity: string) => {
    return characterService.getRarityColor(rarity);
  };

  const getRarityLabel = (rarity: string) => {
    return characterService.getRarityLabel(rarity);
  };

  const getHappinessStatus = (happiness: number) => {
    return characterService.getHappinessStatus(happiness);
  };

  const renderCharacterCard = (character: UserCharacter) => {
    const happinessStatus = getHappinessStatus(character.happiness);
    const rarityColor = getRarityColor(character.character.rarity);
    const rarityLabel = getRarityLabel(character.character.rarity);

    return (
      <View key={character.id} style={styles.characterCard}>
        <View style={styles.characterHeader}>
          <Text style={styles.characterEmoji}>🐾</Text>
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>
              {character.nickname || character.character.name}
            </Text>
            <Text style={styles.characterOriginalName}>
              {character.character.name}
            </Text>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.rarityText}>{rarityLabel}</Text>
            </View>
          </View>
          {character.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>활성</Text>
            </View>
          )}
        </View>

        <View style={styles.characterStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>레벨</Text>
            <Text style={styles.statValue}>{character.level}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>경험치</Text>
            <Text style={styles.statValue}>{character.experience}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>행복도</Text>
            <Text style={[styles.statValue, { color: happinessStatus.color }]}>
              {character.happiness}%
            </Text>
          </View>
        </View>

        <View style={styles.characterActions}>
          {!character.isActive && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetActiveCharacter(character)}
            >
              <Text style={styles.actionButtonText}>활성화</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleFeedCharacter(character)}
          >
            <Text style={styles.actionButtonText}>먹이주기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePlayWithCharacter(character)}
          >
            <Text style={styles.actionButtonText}>놀아주기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>캐릭터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 내 캐릭터</Text>
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
          {renderCharacterCard(activeCharacter)}
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
              .map(renderCharacterCard)
          )}
        </ScrollView>
      </View>

      {/* 캐릭터 상점 */}
      <View style={styles.shopSection}>
        <Text style={styles.sectionTitle}>캐릭터 상점</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.shopList}
        >
          {characterShop
            .filter(char => !char.isOwned)
            .map(character => (
              <TouchableOpacity
                key={character.id}
                style={styles.shopItem}
                onPress={() => handlePurchaseCharacter(character.id)}
                disabled={purchasingCharacters.has(character.id)}
              >
                <Text style={styles.characterEmoji}>🐾</Text>
                <Text style={styles.shopItemName}>{character.name}</Text>
                <View style={[
                  styles.rarityBadge, 
                  { backgroundColor: getRarityColor(character.rarity) }
                ]}>
                  <Text style={styles.rarityText}>{getRarityLabel(character.rarity)}</Text>
                </View>
                <Text style={styles.shopItemPrice}>💰 {character.price}</Text>
                <Text style={styles.shopItemDescription}>{character.description}</Text>
                <Text style={styles.purchaseText}>
                  {purchasingCharacters.has(character.id) ? '구매 중...' : '구매하기'}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* 입양 모달 */}
      <Modal
        visible={adoptModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdoptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>캐릭터 입양</Text>
            <Text style={styles.modalSubtitle}>캐릭터의 이름을 지어주세요 (선택사항)</Text>
            <TextInput
              style={styles.nicknameInput}
              placeholder="캐릭터 이름"
              value={nickname}
              onChangeText={setNickname}
              maxLength={10}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setAdoptModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAdoptCharacter}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  입양하기
                </Text>
              </TouchableOpacity>
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
  characterEmoji: {
    fontSize: 32,
    marginRight: 12,
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
  },
  actionButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
});

export default CharacterScreen; 