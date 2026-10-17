import { GoogleProfile, UserDTO } from "../../types/auth.types";

export interface IUserRepository {
  upsertFromGoogle(profile: GoogleProfile): Promise<UserDTO>;
  findById(id: string): Promise<UserDTO | null>;
}
