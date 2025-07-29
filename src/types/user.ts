export interface User {
  id: number;
  email: string;
  name: string;
  nickName: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserNicknameUpdate {
  nickName: string;
}

export interface UserPasswordUpdate {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
