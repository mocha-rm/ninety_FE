import api from './api';
import { ApiResponse } from '../types/auth';
import { UserRoom, PlaceItemRequest } from '../types/room';

class RoomService {
  async getUserRoom(): Promise<UserRoom> {
    const response = await api.get<ApiResponse<UserRoom>>('/game/user-room');
    return response.data.data;
  }

  async placeItem(roomId: number, data: PlaceItemRequest): Promise<void> {
    await api.post<ApiResponse<void>>(`/game/user-room/${roomId}/placed-items`, data);
  }

  async moveItem(roomId: number, placedItemId: number, data: PlaceItemRequest): Promise<void> {
    await api.put<ApiResponse<void>>(`/game/user-room/${roomId}/placed-items/${placedItemId}`, data);
  }

  async removeItem(roomId: number, placedItemId: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/game/user-room/${roomId}/placed-items/${placedItemId}`);
  }

  async createInitialUserRoom(): Promise<UserRoom> {
    const response = await api.post<ApiResponse<UserRoom>>('/game/user-room/initial');
    return response.data.data;
  }
}

export const roomService = new RoomService();
export default roomService;