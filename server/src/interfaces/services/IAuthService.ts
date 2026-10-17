import { AuthResult, UserDTO } from "../../types/auth.types";

export interface IAuthService {
  loginWithGoogle(credential: string, userAgent?: string): Promise<AuthResult>;
  refresh(refreshToken: string): Promise<AuthResult>;
  logout(refreshToken?: string): Promise<void>;
  getUser(userId: string): Promise<UserDTO>;
}
