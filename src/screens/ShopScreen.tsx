import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoom } from '../contexts/RoomContext';
import { useGame } from '../contexts/GameContext';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { ShopItem } from '../types/room';

const ShopScreen: React.FC = () => {
  const { shopItems, purchaseItem } = useRoom();
  const { userGameData } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasingItems, setPurchasingItems] = useState<Set<number>>(new Set());

  const categories = [
    { id: 'all', label: '전체', emoji: '🏪' },
    { id: 'furniture', label: '가구', emoji: '🪑' },
    { id: 'decoration', label: '장식품', emoji: '🖼️' },
    { id: 'wallpaper', label: '벽지', emoji: '🎨' },
    { id: 'floor', label: '바닥', emoji: '🏠' },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

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
              const success = await purchaseItem(item.id);
              
              if (success) {
                Alert.alert('구매 완료', `${item.name}을(를) 구매했습니다!`);
              } else {
                Alert.alert('구매 실패', '아이템 구매에 실패했습니다.');
              }
            } catch (error) {
              Alert.alert('오류', '구매 중 오류가 발생했습니다.');
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

  const getItemEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      furniture: '🪑',
      decoration: '🖼️',
      wallpaper: '🎨',
      floor: '🏠',
    };
    return emojiMap[category] || '📦';
  };

  const getCategoryLabel = (category: string) => {
    const labelMap: { [key: string]: string } = {
      furniture: '가구',
      decoration: '장식품',
      wallpaper: '벽지',
      floor: '바닥',
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

      {/* 카테고리 필터 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.id)}
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

      {/* 아이템 목록 */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>이 카테고리에 아이템이 없습니다.</Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemEmoji}>{getItemEmoji(item.category)}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemCategory}>{getCategoryLabel(item.category)}</Text>
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
                      !!(userGameData && userGameData.coins < item.price)
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
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategoryButton: {
    backgroundColor: '#6366F1',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#1b0d12',
    fontWeight: '600',
  },
  selectedCategoryLabel: {
    color: 'white',
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 16,
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