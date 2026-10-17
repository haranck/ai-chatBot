export interface UserDTO {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  prevTokenHash: string | null;
  rotatedAt: Date | null;
}

export interface AuthResult {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}
