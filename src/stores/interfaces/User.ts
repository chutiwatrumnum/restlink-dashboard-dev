// เพิ่มใน stores/interfaces/User.ts (ถ้ายังไม่มี)
export interface LoginPayloadType {
  username: string;
  password: string;
}

export interface UserType {
  userId: string | null;
  userFirstName: string;
  userLastName: string;
  isAuth: boolean;
  userToken: string | null;
  isSignUpModalOpen: boolean;
  isConfirmDetailModalOpen: boolean;
}

export interface ResetPasswordPayloadType {
  token?: string;
  password: string;
  confirmPassword: string;
}