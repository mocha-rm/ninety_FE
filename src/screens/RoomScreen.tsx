import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoom } from '../contexts/RoomContext';
import { useGame } from '../contexts/GameContext';
import { PlacedRoomItem } from '../types/room';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ROOM_WIDTH = screenWidth - 32;
const ROOM_HEIGHT = screenHeight * 0.6;

const RoomScreen: React.FC = () => {
  const { userRoom, userItems, loading, placeItem, removePlacedItem } = useRoom();
  const { userGameData } = useGame();
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const handlePlaceItem = async (itemId: number) => {
    if (!userGameData) return;

    // 간단한 배치 로직: 중앙에 배치
    const position = {
      x: ROOM_WIDTH / 2 - 25,
      y: ROOM_HEIGHT / 2 - 25,
    };

    const success = await placeItem(itemId, position, 0);
    if (success) {
      Alert.alert('성공', '아이템이 방에 배치되었습니다!');
      setSelectedItem(null);
    } else {
      Alert.alert('오류', '아이템 배치에 실패했습니다.');
    }
  };

  const handleRemoveItem = async (placedItemId: number) => {
    Alert.alert(
      '아이템 제거',
      '이 아이템을 방에서 제거하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제거',
          style: 'destructive',
          onPress: async () => {
            const success = await removePlacedItem(placedItemId);
            if (success) {
              Alert.alert('성공', '아이템이 제거되었습니다.');
            } else {
              Alert.alert('오류', '아이템 제거에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderRoomItem = (placedItem: PlacedRoomItem) => {
    const { position, rotation, item } = placedItem;
    
    return (
      <TouchableOpacity
        key={placedItem.id}
        style={[
          styles.roomItem,
          {
            left: position.x,
            top: position.y,
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
        onLongPress={() => handleRemoveItem(placedItem.id)}
      >
        <Text style={styles.itemEmoji}>
          {getItemEmoji(item.category)}
        </Text>
      </TouchableOpacity>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>방을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏠 내 방</Text>
      </View>

      {/* 방 영역 */}
      <View style={styles.roomContainer}>
        <View style={styles.room}>
          {userRoom?.items.map(renderRoomItem)}
        </View>
      </View>

      {/* 배치 가능한 아이템 목록 */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>배치할 아이템</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.itemsScrollView}
        >
          {userItems
            .filter(item => item.isOwned && !item.isPlaced)
            .map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  selectedItem === item.id && styles.selectedItemCard,
                ]}
                onPress={() => setSelectedItem(item.id)}
              >
                <Text style={styles.itemEmoji}>{getItemEmoji(item.category)}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{getCategoryLabel(item.category)}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* 배치 버튼 */}
      {selectedItem && (
        <View style={styles.placementSection}>
          <TouchableOpacity
            style={styles.placeButton}
            onPress={() => handlePlaceItem(selectedItem)}
          >
            <Text style={styles.placeButtonText}>방에 배치하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 안내 텍스트 */}
      <View style={styles.helpSection}>
        <Text style={styles.helpText}>
          💡 아이템을 길게 누르면 제거할 수 있습니다
        </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fcf8f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b0d12',
    textAlign: 'center',
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
  roomContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  room: {
    width: ROOM_WIDTH,
    height: ROOM_HEIGHT,
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    position: 'relative',
  },
  roomItem: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 12,
  },
  itemsScrollView: {
    flexGrow: 0,
  },
  itemCard: {
    width: 80,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedItemCard: {
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#f0f4ff',
  },
  itemName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1b0d12',
    textAlign: 'center',
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 8,
    color: '#9a4c66',
    textAlign: 'center',
    marginTop: 2,
  },
  placementSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  placeButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  placeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#9a4c66',
    textAlign: 'center',
  },
});

export default RoomScreen; 