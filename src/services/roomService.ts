import api from './api';
import { ApiResponse } from '../types/auth';
import { 
  UserRoom, 
  RoomItem, 
  PlacedRoomItem, 
  CreatePlacedItemRequest, 
  UpdatePlacedItemRequest,
  ShopItem 
} from '../types/room';

class RoomService {
  // 사용자 방 정보 조회
  async getUserRoom(): Promise<UserRoom> {
    const response = await api.get<ApiResponse<UserRoom>>('/api/room/user-room');
    return response.data.data;
  }

  // 사용자 방 생성 (최초 접속시)
  async createUserRoom(): Promise<UserRoom> {
    const response = await api.post<ApiResponse<UserRoom>>('/api/room/user-room');
    return response.data.data;
  }

  // 상점 아이템 목록 조회
  async getShopItems(category?: string): Promise<ShopItem[]> {
    const url = category 
      ? `/api/room/shop?category=${category}`
      : '/api/room/shop';
    const response = await api.get<ApiResponse<ShopItem[]>>(url);
    return response.data.data;
  }

  // 아이템 구매
  async purchaseItem(itemId: number): Promise<RoomItem> {
    const response = await api.post<ApiResponse<RoomItem>>(`/api/room/shop/purchase/${itemId}`);
    return response.data.data;
  }

  // 아이템 배치
  async placeItem(data: CreatePlacedItemRequest): Promise<PlacedRoomItem> {
    const response = await api.post<ApiResponse<PlacedRoomItem>>('/api/room/items/place', data);
    return response.data.data;
  }

  // 배치된 아이템 수정
  async updatePlacedItem(placedItemId: number, data: UpdatePlacedItemRequest): Promise<PlacedRoomItem> {
    const response = await api.patch<ApiResponse<PlacedRoomItem>>(`/api/room/items/${placedItemId}`, data);
    return response.data.data;
  }

  // 배치된 아이템 제거
  async removePlacedItem(placedItemId: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/room/items/${placedItemId}`);
  }

  // 벽지 변경
  async changeWallpaper(wallpaperId: number): Promise<UserRoom> {
    const response = await api.patch<ApiResponse<UserRoom>>('/api/room/wallpaper', { wallpaperId });
    return response.data.data;
  }

  // 바닥 변경
  async changeFloor(floorId: number): Promise<UserRoom> {
    const response = await api.patch<ApiResponse<UserRoom>>('/api/room/floor', { floorId });
    return response.data.data;
  }

  // 사용자 소유 아이템 목록 조회
  async getUserItems(): Promise<RoomItem[]> {
    const response = await api.get<ApiResponse<RoomItem[]>>('/api/room/user-items');
    return response.data.data;
  }

  // 카테고리별 아이템 필터링 헬퍼 함수
  filterItemsByCategory(items: RoomItem[], category: string): RoomItem[] {
    return items.filter(item => item.category === category);
  }

  // 배치 가능한 아이템 필터링 헬퍼 함수
  filterPlaceableItems(items: RoomItem[]): RoomItem[] {
    return items.filter(item => item.isOwned && !item.isPlaced);
  }
}

export default new RoomService(); 