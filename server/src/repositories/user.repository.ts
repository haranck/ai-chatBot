import User from "../models/user.model";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { GoogleProfile, UserDTO } from "../types/auth.types";
import { isObjectId } from "../utils/objectId";

const toUser = (doc: { _id: unknown; email: string; name: string; avatar?: string | null }): UserDTO => ({
  id: String(doc._id),
  email: doc.email,
  name: doc.name,
  avatar: doc.avatar ?? null,
});

export class UserRepository implements IUserRepository {
  async upsertFromGoogle(profile: GoogleProfile): Promise<UserDTO> {
    const user = await User.findOneAndUpdate(
      { googleId: profile.googleId },
      {
        $set: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          lastLoginAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
    ).lean();

    return toUser(user!);
  }

  async findById(id: string): Promise<UserDTO | null> {
    if (!isObjectId(id)) return null;
    const user = await User.findById(id).lean();
    return user ? toUser(user) : null;
  }
}
