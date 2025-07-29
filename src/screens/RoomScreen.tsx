import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image, Modal, FlatList, ScrollView } from 'react-native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { useRoom } from '../contexts/RoomContext';
import { useCharacter } from '../contexts/CharacterContext';
import roomItemService from '../services/roomItemService';
import userItemService from '../services/userItemService';
import roomService from '../services/roomService';
import { PlacedItem, RoomItem, ItemCategory, UserItem } from '../types/room';
import { useFocusEffect } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';

// 기본 배경 이미지 (로컬 에셋)
const DEFAULT_BACKGROUND_IMAGE = require('../../assets/images/room_backgrounds/default_background.png');

interface DraggablePlacedItemProps {
  item: PlacedItem;
  imageUrl: string;
  roomDimensions: { width: number; height: number };
  onMoveEnd: (x: number, y: number) => void;
  onRemove: () => void;
}

const DraggablePlacedItem: React.FC<DraggablePlacedItemProps> = ({ 
  item, 
  imageUrl, 
  roomDimensions, 
  onMoveEnd, 
  onRemove 
}) => {
  const translateX = useSharedValue(item.posX);
  const translateY = useSharedValue(item.posY);

  const itemWidth = 100; // 아이템의 실제 너비 (스타일과 일치해야 함)
  const itemHeight = 100; // 아이템의 실제 높이 (스타일과 일치해야 함)

  const pan = Gesture.Pan()
    .onBegin(() => {
      // 시작 시 현재 위치 저장
    })
    .onUpdate((event) => {
      const newX = item.posX + event.translationX;
      const newY = item.posY + event.translationY;

      // 바운더리 제한
      translateX.value = Math.max(0, Math.min(newX, roomDimensions.width - itemWidth));
      translateY.value = Math.max(0, Math.min(newY, roomDimensions.height - itemHeight));
    })
    .onEnd(() => {
      runOnJS(onMoveEnd)(translateX.value, translateY.value);
    });

  const tap = Gesture.Tap()
    .onEnd(() => {
      runOnJS(onRemove)();
    });

  const composed = Gesture.Simultaneous(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${item.rotation}deg` },
    ],
    width: itemWidth,
    height: itemHeight,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.Image
        source={{ uri: imageUrl }}
        style={[styles.placedItemImage, animatedStyle]}
        resizeMode="contain"
      />
    </GestureDetector>
  );
};

const RoomScreen: React.FC = () => {
  const { userRoom, loading, refreshUserRoom } = useRoom();
  const { activeCharacter, refreshCharacters } = useCharacter();
  const [myItemsModalVisible, setMyItemsModalVisible] = useState(false);
  const [myRoomItems, setMyRoomItems] = useState<UserItem[]>([]);
  const [myItemsLoading, setMyItemsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [roomDimensions, setRoomDimensions] = useState({ width: 0, height: 0 });

  const handleRemovePlacedItem = async (placedItemId: number) => {
    if (!userRoom) return;

    Alert.alert(
      '아이템 제거',
      '정말로 이 아이템을 방에서 제거하시겠습니까? (인벤토리로 돌아갑니다)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제거',
          onPress: async () => {
            try {
              await roomService.removeItem(userRoom.userRoomId, placedItemId);
              Alert.alert('성공', '아이템이 방에서 제거되었습니다.');
              refreshUserRoom();
            } catch (e: any) {
              console.error('아이템 제거 실패:', e);
              const message = e.response?.data?.message || '아이템 제거에 실패했습니다.';
              Alert.alert('오류', message);
            }
          },
        },
      ]
    );
  };

  const itemCategories = [
    { id: 'all', label: '전체', emoji: '🏪' },
    { id: ItemCategory.FURNITURE, label: '가구', emoji: '🪑' },
    { id: ItemCategory.PLAYGROUND, label: '놀이터', emoji: '🎠' },
    { id: ItemCategory.DECORATION, label: '장식품', emoji: '🖼️' },
    { id: ItemCategory.BACKGROUND, label: '배경', emoji: '🏞️' },
    { id: ItemCategory.PROP, label: '소품', emoji: '🧸' },
  ];

  useFocusEffect(
    useCallback(() => {
      refreshUserRoom();
      refreshCharacters();
    }, [refreshUserRoom, refreshCharacters])
  );

  const handleCreateInitialRoom = async () => {
    try {
      // await roomService.createInitialUserRoom(); // This line was removed
      Alert.alert('성공', '방이 생성되었습니다!');
      refreshUserRoom();
    } catch (error: any) {
      console.error('초기 방 생성 실패:', error);
      const message = error.response?.data?.message || '방 생성에 실패했습니다.';
      Alert.alert('오류', message);
    }
  };

  const openMyItemsModal = async () => {
    setMyItemsLoading(true);
    setMyItemsModalVisible(true);
    try {
      const res = await userItemService.getUserItems();
      console.log('My Room Items:', res.content); // 추가된 console.log
      setMyRoomItems(res.content);
    } catch (e) {
      Alert.alert('오류', '내 아이템을 불러오지 못했습니다.');
    } finally {
      setMyItemsLoading(false);
    }
  };

  const closeMyItemsModal = () => {
    setMyItemsModalVisible(false);
  };

  const handlePlaceItem = async (item: UserItem) => {
    if (!userRoom) return;
    try {
      await roomService.placeItem(userRoom.userRoomId, item.id, {
        posX: 100, // 방 중앙(임시값, 추후 개선 가능)
        posY: 100,
        rotation: 0,
      });
      Alert.alert('성공', '아이템이 방에 배치되었습니다!');
      closeMyItemsModal();
      refreshUserRoom();
    } catch (e) {
      Alert.alert('오류', '아이템 배치에 실패했습니다.');
    }
  };

  const getBackgroundImageSource = () => {
    if (!userRoom || !userRoom.items) return DEFAULT_BACKGROUND_IMAGE;
    const backgroundItem = userRoom.items.find(item => item.category === ItemCategory.BACKGROUND);
    if (backgroundItem && backgroundItem.imageUrl) {
      return { uri: backgroundItem.imageUrl };
    } else {
      return DEFAULT_BACKGROUND_IMAGE;
    }
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>방 불러오는 중...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  const backgroundImageSource = getBackgroundImageSource();

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>나의 방</Text>
          <TouchableOpacity style={styles.myItemsButton} onPress={openMyItemsModal}>
            <Text style={styles.myItemsButtonText}>내 아이템</Text>
          </TouchableOpacity>
        </View>
        {userRoom ? (
          <View style={styles.roomContent} onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setRoomDimensions({ width, height });
          }}>
            <Image source={backgroundImageSource} style={styles.roomBackground} />
            <View style={styles.placedItemsContainer}>
              {userRoom && userRoom.items && userRoom.items.map((item: PlacedItem) => {
                if (!item.imageUrl || item.category === ItemCategory.BACKGROUND) return null; // 배경 이미지는 따로 처리
                return (
                  <DraggablePlacedItem
                    key={item.id}
                    item={item}
                    imageUrl={item.imageUrl}
                    roomDimensions={roomDimensions}
                    onMoveEnd={async (x, y) => {
                      try {
                        await roomService.moveItem(userRoom.userRoomId, item.id, {
                          posX: Math.round(x),
                          posY: Math.round(y),
                          rotation: item.rotation,
                        });
                        refreshUserRoom();
                      } catch (e) {
                        Alert.alert('오류', '아이템 이동에 실패했습니다.');
                      }
                    }}
                    onRemove={() => handleRemovePlacedItem(item.id)}
                  />
                );
              })}
              {activeCharacter && activeCharacter.character && (
                <Image
                  source={{ uri: activeCharacter.character.imageUrl }}
                  style={styles.activeCharacterImage}
                />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyRoom}>
            <Text style={styles.emptyRoomText}>아직 방이 없습니다.</Text>
            <Text style={styles.emptyRoomSubText}>새로운 방을 만들어보세요!</Text>
            <TouchableOpacity style={styles.createRoomButton} onPress={handleCreateInitialRoom}>
              <Text style={styles.createRoomButtonText}>방 만들기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Modal
        visible={myItemsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeMyItemsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>내 아이템</Text>
            {/* 카테고리 필터 탭 */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              {itemCategories.map(category => (
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
                  ]}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {myItemsLoading ? (
              <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 30 }} />
            ) : (
              <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
                {myRoomItems.filter(item => selectedCategory === 'all' || item.category === selectedCategory).length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>이 카테고리에 아이템이 없습니다.</Text>
                  </View>
                ) : (
                  myRoomItems
                    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                    .map(item => (
                      <View key={item.id} style={styles.itemCard}>
                        <Image source={{ uri: item.imageUrl }} style={styles.itemImageLarge} />
                        <View style={styles.itemInfoCard}>
                          <Text style={styles.itemNameCard}>{item.itemName}</Text>
                          <Text style={styles.itemDescCard}>{item.itemDescription}</Text>
                          <Text style={styles.itemCategoryCard}>{itemCategories.find(c => c.id === item.category)?.label || item.category}</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.placeButtonCard, item.placed && styles.placedButtonCard]}
                          onPress={() => handlePlaceItem(item)}
                          disabled={item.placed}
                        >
                          <Text style={styles.placeButtonTextCard}>
                            {item.placed ? '배치됨' : '배치'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                )}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeMyItemsModal}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6366F1',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fcf8f9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b0d12',
  },
  myItemsButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  myItemsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roomContent: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden', // 아이템이 방 밖으로 나가지 않도록
  },
  roomBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placedItemsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  placedItemImage: {
    position: 'absolute',
    width: 100, // 임시 크기, 실제 아이템 크기에 따라 조절 필요
    height: 100, // 임시 크기, 실제 아이템 크기에 따라 조절 필요
    resizeMode: 'contain',
    zIndex: 1, // 아이템이 배경 위에 오도록 설정
  },
  activeCharacterImage: {
    position: 'absolute',
    width: 120, // 캐릭터 크기 조정
    height: 120, // 캐릭터 크기 조정
    bottom: 50, // 바닥에서부터의 거리 조정
    left: '50%', // 중앙 정렬을 위해 left 50% 설정
    marginLeft: -60, // width의 절반만큼 margin-left 음수 값으로 설정하여 정확한 중앙 정렬
    resizeMode: 'contain',
    zIndex: 2, // 캐릭터가 아이템 위에 오도록 설정
  },
  emptyRoom: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRoomText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9a4c66',
    marginBottom: 8,
  },
  emptyRoomSubText: {
    fontSize: 14,
    color: '#9a4c66',
    textAlign: 'center',
  },
  createRoomButton: {
    marginTop: 20,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  createRoomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1b0d12',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  itemImageSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b0d12',
  },
  itemDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  placeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContentLarge: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '92%',
    height: '80%', // 고정 높이로 변경
    maxHeight: undefined, // maxHeight 제거
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 18,
    marginTop: 5,
  },
  categoryContainer: {
    alignItems: 'center',
    paddingHorizontal: 16, // Add horizontal padding
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingVertical: 0,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 19,
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
    color: '#6366F1',
    fontWeight: '600',
    lineHeight: 20, // Add lineHeight
  },
  selectedCategoryLabel: {
    color: 'white',
  },
  itemsContainer: {
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
    flex: 1, // 스크롤 영역이 남는 공간을 모두 차지하게
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImageLarge: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#e0e7ef',
  },
  itemInfoCard: {
    flex: 1,
    flexDirection: 'column',
  },
  itemNameCard: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1b0d12',
    marginBottom: 2,
  },
  itemDescCard: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  itemCategoryCard: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  placeButtonCard: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 12,
  },
  placeButtonTextCard: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  placedButtonCard: {
    backgroundColor: '#ccc',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    color: '#aaa',
    fontSize: 15,
  },
});

export default RoomScreen;