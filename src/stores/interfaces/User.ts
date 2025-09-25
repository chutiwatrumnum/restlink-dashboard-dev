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
  vmsUrl?: string | null;
  vmsToken?: string | null;
  roleName?: string | null;
}

export interface ResetPasswordPayloadType {
  token: string | null;
  sessionId: string | null;
  newPassword: string;
  confirmNewPassword: string;
}
