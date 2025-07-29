import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useGame } from '../contexts/GameContext';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { RoomItem, ItemCategory } from '../types/room';
import { Character } from '../types/character';
import roomItemService from '../services/roomItemService';
import characterService from '../services/characterService';
import userItemService from '../services/userItemService';
import userCharacterService from '../services/userCharacterService';
import { useFocusEffect } from '@react-navigation/native';

type ShopItem = (RoomItem & { isOwned: boolean }) | (Character & { isOwned: boolean });

const ShopScreen: React.FC = () => {
  const { userGameData, refreshGameData } = useGame();
  const [selectedShopType, setSelectedShopType] = useState<'room' | 'character'>('room');
  const [roomItems, setRoomItems] = useState<ShopItem[]>([]);
  const [characters, setCharacters] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [purchasingItems, setPurchasingItems] = useState<Set<number>>(new Set());

  const roomCategories = [
    { id: 'all', label: '전체', emoji: '🏪' },
    { id: ItemCategory.FURNITURE, label: '가구', emoji: '🪑' },
    { id: ItemCategory.PLAYGROUND, label: '놀이터', emoji: '🎠' },
    { id: ItemCategory.DECORATION, label: '장식품', emoji: '🖼️' },
    { id: ItemCategory.BACKGROUND, label: '배경', emoji: '🏞️' },
    { id: ItemCategory.PROP, label: '소품', emoji: '🧸' },
  ];

  const loadShopItems = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch owned items/characters first
      const ownedRoomItemsResponse = await userItemService.getUserItems();
      const ownedRoomItemIds = new Set(ownedRoomItemsResponse.content.map(item => item.itemId));

      const ownedUserCharactersResponse = await userCharacterService.getUserCharacters();
      const ownedCharacterIds = new Set(ownedUserCharactersResponse.content.map(char => char.characterId));

      if (selectedShopType === 'room') {
        const response = await roomItemService.getRoomItems(selectedCategory === 'all' ? undefined : selectedCategory);
        const itemsWithOwnedStatus = response.content.map(item => ({
          ...item,
          isOwned: ownedRoomItemIds.has(item.id),
        }));
        setRoomItems(itemsWithOwnedStatus);
      } else {
        const response = await characterService.getCharacters();
        const charactersWithOwnedStatus = response.content.map(char => ({
          ...char,
          isOwned: ownedCharacterIds.has(char.id),
        }));
        setCharacters(charactersWithOwnedStatus);
      }
    } catch (error) {
      console.error('상점 아이템 로드 실패:', error);
      Alert.alert('오류', '상점 아이템을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedShopType, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadShopItems();
    }, [loadShopItems])
  );

  const handlePurchase = async (item: ShopItem) => {
    if (!userGameData) {
      Alert.alert('오류', '게임 데이터를 불러올 수 없습니다.');
      return;
    }

    if (item.isOwned) {
      Alert.alert('알림', '이미 소유한 아이템입니다.');
      return;
    }

    if (userGameData.coins < item.price) {
      Alert.alert('코인 부족', '코인이 부족합니다. 습관을 완료해서 코인을 모아보세요!');
      return;
    }

    Alert.alert(
      '아이템 구매',
      `${item.name}을(를) ${item.price}코인에 구매하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '구매',
          onPress: async () => {
            try {
              setPurchasingItems(prev => new Set(prev).add(item.id));
              if (selectedShopType === 'room') {
                await userItemService.buyItem({ itemId: item.id });
              } else {
                await userCharacterService.purchaseCharacter(item.id);
              }
              Alert.alert('구매 완료', `${item.name}을(를) 구매했습니다!`);
              refreshGameData(); // 게임 데이터 (코인) 새로고침
              loadShopItems(); // 상점 아이템 목록 새로고침 (소유 여부 반영)
            } catch (error: any) {
              console.error('구매 실패:', error);
              const message = error.response?.data?.message || '아이템 구매에 실패했습니다.';
              Alert.alert('오류', message);
            } finally {
              setPurchasingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(item.id);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const getItemEmoji = (category: ItemCategory) => {
    const emojiMap: { [key in ItemCategory]: string } = {
      [ItemCategory.FURNITURE]: '🪑',
      [ItemCategory.PLAYGROUND]: '🎠',
      [ItemCategory.DECORATION]: '🖼️',
      [ItemCategory.BACKGROUND]: '🏞️',
      [ItemCategory.PROP]: '🧸',
    };
    return emojiMap[category] || '📦';
  };

  const getCategoryLabel = (category: ItemCategory) => {
    const labelMap: { [key in ItemCategory]: string } = {
      [ItemCategory.FURNITURE]: '가구',
      [ItemCategory.PLAYGROUND]: '놀이터',
      [ItemCategory.DECORATION]: '장식품',
      [ItemCategory.BACKGROUND]: '배경',
      [ItemCategory.PROP]: '소품',
    };
    return labelMap[category] || category;
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 상점</Text>
        {userGameData && (
          <View style={styles.coinDisplay}>
            <Text style={styles.coinText}>💰 {userGameData.coins} 코인</Text>
          </View>
        )}
      </View>

      {/* 상점 타입 선택 (방 아이템 / 캐릭터) */}
      <View style={styles.shopTypeContainer}>
        <TouchableOpacity
          style={[
            styles.shopTypeButton,
            selectedShopType === 'room' && styles.selectedShopTypeButton,
          ]}
          onPress={() => {
            setSelectedShopType('room');
            setSelectedCategory('all'); // 카테고리 초기화
          }}
        >
          <Text style={[
            styles.shopTypeButtonText,
            selectedShopType === 'room' && styles.shopTypeButtonText,
          ]}>방 아이템</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.shopTypeButton,
            selectedShopType === 'character' && styles.selectedShopTypeButton,
          ]}
          onPress={() => setSelectedShopType('character')}
        >
          <Text style={[
            styles.shopTypeButtonText,
            selectedShopType === 'character' && styles.shopTypeButtonText,
          ]}>캐릭터</Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 필터 (방 아이템일 경우에만 표시) */}
      {selectedShopType === 'room' && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {roomCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category.id as ItemCategory | 'all')}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.selectedCategoryLabel,
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 아이템 목록 */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingStateText}>아이템 불러오는 중...</Text>
          </View>
        ) : (
          (selectedShopType === 'room' ? roomItems : characters).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>이 카테고리에 아이템이 없습니다.</Text>
            </View>
          ) : (
            (selectedShopType === 'room' ? roomItems : characters).map(item => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemLeft}>
                  {selectedShopType === 'room' ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  ) : (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    {selectedShopType === 'room' && 'category' in item && (
                      <Text style={styles.itemCategory}>{getCategoryLabel((item as RoomItem).category)}</Text>
                    )}
                    {selectedShopType === 'character' && (
                      <Text style={styles.itemCategory}>레어도: {(item as Character).rarity}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemPrice}>💰 {item.price}</Text>
                  {item.isOwned ? (
                    <View style={styles.ownedBadge}>
                      <Text style={styles.ownedText}>소유함</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.purchaseButton,
                        userGameData && userGameData.coins < item.price && styles.disabledButton,
                        purchasingItems.has(item.id) && styles.purchasingButton,
                      ]}
                      onPress={() => handlePurchase(item)}
                      disabled={
                        purchasingItems.has(item.id) || 
                        !!(userGameData && userGameData.coins < item.price) ||
                        item.isOwned
                      }
                    >
                      <Text style={styles.purchaseButtonText}>
                        {purchasingItems.has(item.id) ? '구매 중...' : '구매'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
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
  shopTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fcf8f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e7eb',
  },
  shopTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  selectedShopTypeButton: {
    backgroundColor: '#6366F1',
  },
  shopTypeButtonText: {
    color: '#1b0d12',
    fontWeight: 'bold',
  },
  selectedShopTypeButtonText: {
    color: 'white',
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingVertical: 0,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategoryButton: {
    backgroundColor: '#6366F1',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
    lineHeight: 20, // Add lineHeight
  },
  categoryLabel: {
    fontSize: 14,
    color: '#1b0d12',
    fontWeight: '600',
    lineHeight: 20, // Add lineHeight
  },
  selectedCategoryLabel: {
    color: 'white',
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6366F1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9a4c66',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#9a4c66',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 8,
  },
  ownedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ownedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  purchasingButton: {
    backgroundColor: '#9a4c66',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ShopScreen;
