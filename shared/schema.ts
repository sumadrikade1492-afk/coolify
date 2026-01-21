export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  birthMonth: integer("birth_month"), // 1-12
  birthYear: integer("birth_year"),
  gender: text("gender"), // 'Male' | 'Female'
  country: text("country"), // Current country
  city: text("city"), // Current city
  nativePlace: text("native_place"), // Native place in India
  nativeLanguage: text("native_language"), // Native language
  denomination: text("denomination"),
  otherDenomination: text("other_denomination"), // Free-form field when denomination is "Other" (optional)
  occupation: text("occupation"),
  visaType: text("visa_type"), // H1B, Green Card, Citizen, OPT, etc.
  height: text("height"), // Height in feet/inches format e.g. "5'8"
  yearsInUS: integer("years_in_us"), // Number of years living in the US
  aboutMe: text("about_me"),
  partnerPreferences: text("partner_preferences"),
  photoUrl: text("photo_url"), // Optional - photo upload
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  createdBy: text("created_by"), // 'Self', 'Parent', etc.
  createdByName: text("created_by_name"), // Name of person who created profile if not self (optional when Self)
  createdAt: timestamp("created_at").defaultNow(),
  // Arranged marriage specific fields
  education: text("education"), // Bachelor's, Master's, PhD, etc.
  maritalStatus: text("marital_status"), // Never Married, Divorced, Widowed
  hasChildren: text("has_children"), // No, Yes - lives with me, Yes - doesn't live with me
  familyType: text("family_type"), // Nuclear, Joint, Extended
  diet: text("diet"), // Vegetarian, Non-vegetarian, Eggetarian
  drinking: text("drinking"), // Never, Occasionally, Regularly
  smoking: text("smoking"), // Never, Occasionally, Regularly
  willingToRelocate: text("willing_to_relocate"), // Yes, No, Maybe
  fathersOccupation: text("fathers_occupation"),
  mothersOccupation: text("mothers_occupation"),
  siblings: text("siblings"), // Number/description of siblings
});

export const phoneVerifications = pgTable("phone_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  phoneNumber: text("phone_number"),
  code: text("code"),
  expiresAt: timestamp("expires_at"),
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
