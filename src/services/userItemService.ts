import api from './api';
import { ApiResponse } from '../types/auth';
import { UserItem, UserItemRequest, ItemCategory } from '../types/room';

class UserItemService {
  async buyItem(data: UserItemRequest): Promise<void> {
    await api.post<ApiResponse<void>>('/game/user-items', data);
  }

  async getUserItem(userItemId: number): Promise<UserItem> {
    const response = await api.get<ApiResponse<UserItem>>(`/game/user-items/${userItemId}`);
    return response.data.data;
  }

  async getUserItems(category?: ItemCategory, page: number = 0, size: number = 20): Promise<{
    content: UserItem[];
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
      content: UserItem[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    }>>('/game/user-items', { params });
    return response.data.data;
  }
}

export const userItemService = new UserItemService();
export default userItemService;
