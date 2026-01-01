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
    country?: string;
  }): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(userId: string, profile: InsertProfile, phoneVerified?: boolean): Promise<Profile>;
  updateProfile(id: number, updates: Partial<InsertProfile>): Promise<Profile>;
  deleteProfile(id: number): Promise<void>;
  createPhoneVerification(userId: string, phoneNumber: string, code: string): Promise<PhoneVerification>;
  verifyPhoneCode(userId: string, phoneNumber: string, code: string): Promise<boolean>;
  isPhoneVerifiedForUser(userId: string, phoneNumber: string): Promise<boolean>;
  consumePhoneVerification(userId: string, phoneNumber: string): Promise<void>;
  markPhoneVerified(profileId: number): Promise<Profile>;
}

export class DatabaseStorage implements IStorage {
  async getProfiles(filters?: {
    gender?: string;
    denomination?: string;
    minAge?: number;
    maxAge?: number;
    country?: string;
  }): Promise<Profile[]> {
    const conditions = [];

    if (filters?.gender) {
      conditions.push(eq(profiles.gender, filters.gender));
    }
    if (filters?.denomination) {
      conditions.push(ilike(profiles.denomination, `%${filters.denomination}%`));
    }
    if (filters?.country) {
      conditions.push(eq(profiles.country, filters.country));
    }
    if (filters?.minAge) {
      const currentYear = new Date().getFullYear();
      const maxBirthYear = currentYear - filters.minAge;
      conditions.push(lte(profiles.birthYear, maxBirthYear));
    }
    if (filters?.maxAge) {
      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - filters.maxAge;
      conditions.push(gte(profiles.birthYear, minBirthYear));
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

  async createProfile(userId: string, profile: InsertProfile, phoneVerified: boolean = false): Promise<Profile> {
    const [newProfile] = await db
      .insert(profiles)
      .values({ ...profile, userId, phoneVerified })
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

  async createPhoneVerification(userId: string, phoneNumber: string, code: string): Promise<PhoneVerification> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.delete(phoneVerifications).where(
      and(eq(phoneVerifications.userId, userId), eq(phoneVerifications.phoneNumber, phoneNumber))
    );
    const [verification] = await db
      .insert(phoneVerifications)
      .values({ userId, phoneNumber, code, expiresAt })
      .returning();
    return verification;
  }

  async verifyPhoneCode(userId: string, phoneNumber: string, code: string): Promise<boolean> {
    const [verification] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.userId, userId),
          eq(phoneVerifications.phoneNumber, phoneNumber),
          eq(phoneVerifications.code, code),
          gt(phoneVerifications.expiresAt, new Date()),
          eq(phoneVerifications.verified, false),
          eq(phoneVerifications.consumed, false)
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

  async isPhoneVerifiedForUser(userId: string, phoneNumber: string): Promise<boolean> {
    const [verification] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.userId, userId),
          eq(phoneVerifications.phoneNumber, phoneNumber),
          eq(phoneVerifications.verified, true),
          eq(phoneVerifications.consumed, false)
        )
      );
    return !!verification;
  }

  async consumePhoneVerification(userId: string, phoneNumber: string): Promise<void> {
    await db
      .update(phoneVerifications)
      .set({ consumed: true })
      .where(
        and(
          eq(phoneVerifications.userId, userId),
          eq(phoneVerifications.phoneNumber, phoneNumber),
          eq(phoneVerifications.verified, true)
        )
      );
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
