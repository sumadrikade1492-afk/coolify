export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthMonth: integer("birth_month").notNull(), // 1-12
  birthYear: integer("birth_year").notNull(),
  gender: text("gender").notNull(), // 'Male' | 'Female'
  country: text("country").notNull(), // Current country
  city: text("city").notNull(), // Current city
  nativePlace: text("native_place"), // Native place in India
  nativeLanguage: text("native_language"), // Native language
  denomination: text("denomination").notNull(),
  otherDenomination: text("other_denomination"), // Free-form field when denomination is "Other"
  occupation: text("occupation"),
  visaType: text("visa_type"), // H1B, Green Card, Citizen, OPT, etc.
  height: text("height"), // Height in feet/inches format e.g. "5'8"
  yearsInUS: integer("years_in_us"), // Number of years living in the US
  aboutMe: text("about_me"),
  partnerPreferences: text("partner_preferences"),
  photoUrl: text("photo_url"),
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  createdBy: text("created_by").notNull(), // 'Self', 'Parent', etc.
  createdByName: text("created_by_name"), // Name of person who created profile if not self
  createdAt: timestamp("created_at").defaultNow(),
});

export const phoneVerifications = pgTable("phone_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  consumed: boolean("consumed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  userId: true,
  phoneVerified: true,
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export const insertPhoneVerificationSchema = createInsertSchema(phoneVerifications).omit({
  id: true,
  createdAt: true,
  verified: true,
});

export type PhoneVerification = typeof phoneVerifications.$inferSelect;
export type InsertPhoneVerification = z.infer<typeof insertPhoneVerificationSchema>;
