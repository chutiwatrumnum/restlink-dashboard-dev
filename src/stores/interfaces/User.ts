export interface UserType {
  userId: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  isAuth: boolean;
  userToken: string | null;
  isSignUpModalOpen: boolean;
  isConfirmDetailModalOpen: boolean;
}
export interface LoginPayloadType {
  username: string;
  password: string;
}

export interface ResetPasswordPayloadType {
  token?: string;
  password: string;
  confirmPassword: string;
}
