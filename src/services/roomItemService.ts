import api from './api';
import { ApiResponse } from '../types/auth';
import { RoomItem, ItemCategory } from '../types/room';

class RoomItemService {
  async getRoomItem(roomItemId: number): Promise<RoomItem> {
    const response = await api.get<ApiResponse<RoomItem>>(`/game/room-items/${roomItemId}`);
    return response.data.data;
  }

  async getRoomItems(category?: ItemCategory, page: number = 0, size: number = 20): Promise<{
    content: RoomItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    const params: any = { page, size };
    if (category) {
      params.category = category;
    }
    const response = await api.get<ApiResponse<{
      content: RoomItem[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    }>>('/game/room-items', { params });
    return response.data.data;
  }
}

export const roomItemService = new RoomItemService();
export default roomItemService;
