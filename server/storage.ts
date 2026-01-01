import { db } from "./db";
import {
  profiles,
  phoneVerifications,
  type Profile,
  type InsertProfile,
  type PhoneVerification,
} from "@shared/schema";
import { eq, and, gte, lte, ilike, gt } from "drizzle-orm";

export interface IStorage {
  getProfiles(filters?: {
    gender?: string;
    denomination?: string;
    minAge?: number;
    maxAge?: number;
    location?: string;
  }): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(userId: string, profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile>;
  deleteProfile(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProfiles(filters?: {
    gender?: string;
    denomination?: string;
    minAge?: number;
    maxAge?: number;
    location?: string;
  }): Promise<Profile[]> {
    const conditions = [];

    if (filters?.gender) {
      conditions.push(eq(profiles.gender, filters.gender));
    }
    if (filters?.denomination) {
      conditions.push(ilike(profiles.denomination, `%${filters.denomination}%`));
    }
    if (filters?.location) {
      conditions.push(ilike(profiles.location, `%${filters.location}%`));
    }
    if (filters?.minAge) {
      conditions.push(gte(profiles.age, filters.minAge));
    }
    if (filters?.maxAge) {
      conditions.push(lte(profiles.age, filters.maxAge));
    }

    if (conditions.length === 0) {
      return await db.select().from(profiles);
    }

    return await db.select().from(profiles).where(and(...conditions));
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(userId: string, profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db
      .insert(profiles)
      .values({ ...profile, userId })
      .returning();
    return newProfile;
  }

  async updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();
    return updated;
  }

  async deleteProfile(id: number): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  async createPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.delete(phoneVerifications).where(eq(phoneVerifications.phoneNumber, phoneNumber));
    const [verification] = await db
      .insert(phoneVerifications)
      .values({ phoneNumber, code, expiresAt })
      .returning();
    return verification;
  }

  async verifyPhoneCode(phoneNumber: string, code: string): Promise<boolean> {
    const [verification] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.phoneNumber, phoneNumber),
          eq(phoneVerifications.code, code),
          gt(phoneVerifications.expiresAt, new Date()),
          eq(phoneVerifications.verified, false)
        )
      );

    if (!verification) {
      return false;
    }

    await db
      .update(phoneVerifications)
      .set({ verified: true })
      .where(eq(phoneVerifications.id, verification.id));

    return true;
  }

  async markPhoneVerified(profileId: number): Promise<Profile> {
    const [updated] = await db
      .update(profiles)
      .set({ phoneVerified: true })
      .where(eq(profiles.id, profileId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
