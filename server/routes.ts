import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api, phoneVerificationApi } from "@shared/routes";
import { z } from "zod";
import { generateVerificationCode, sendVerificationSMS, isTwilioConfigured } from "./twilio";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profile Routes

  app.get(api.profiles.list.path, async (req, res) => {
    try {
      // Parse query params using the schema's input definition if possible, 
      // but express query params are strings, so we might need manual handling or z.coerce in schema
      const filters = {
        gender: req.query.gender as string,
        denomination: req.query.denomination as string,
        location: req.query.location as string,
        minAge: req.query.minAge ? Number(req.query.minAge) : undefined,
        maxAge: req.query.maxAge ? Number(req.query.maxAge) : undefined,
      };
      
      const profiles = await storage.getProfiles(filters);
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.get(api.profiles.get.path, async (req, res) => {
    const profile = await storage.getProfile(Number(req.params.id));
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  });

  app.post(api.profiles.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.profiles.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub; // From Replit Auth
      
      const profile = await storage.createProfile(userId, input);
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.profiles.update.path, isAuthenticated, async (req, res) => {
    try {
      const profileId = Number(req.params.id);
      const userId = (req.user as any).claims.sub;
      
      const existing = await storage.getProfile(profileId);
      if (!existing) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Authorization check: Ensure user owns the profile
      if (existing.userId !== userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const input = api.profiles.update.input.parse(req.body);
      const updated = await storage.updateProfile(profileId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.profiles.delete.path, isAuthenticated, async (req, res) => {
    try {
      const profileId = Number(req.params.id);
      const userId = (req.user as any).claims.sub;
      
      const existing = await storage.getProfile(profileId);
      if (!existing) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Authorization check: Ensure user owns the profile
      if (existing.userId !== userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await storage.deleteProfile(profileId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Phone Verification Routes
  app.post(phoneVerificationApi.sendCode.path, async (req, res) => {
    try {
      if (!isTwilioConfigured()) {
        return res.status(500).json({ message: "Phone verification is not configured" });
      }

      const input = phoneVerificationApi.sendCode.input.parse(req.body);
      const code = generateVerificationCode();
      
      await storage.createPhoneVerification(input.phoneNumber, code);
      const sent = await sendVerificationSMS(input.phoneNumber, code);

      if (!sent) {
        return res.status(500).json({ message: "Failed to send verification code" });
      }

      res.json({ success: true, message: "Verification code sent" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(phoneVerificationApi.verifyCode.path, async (req, res) => {
    try {
      const input = phoneVerificationApi.verifyCode.input.parse(req.body);
      const verified = await storage.verifyPhoneCode(input.phoneNumber, input.code);

      if (!verified) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      if (input.profileId) {
        await storage.markPhoneVerified(input.profileId);
      }

      res.json({ success: true, message: "Phone number verified successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getProfiles();
  if (existing.length === 0) {
    // We can't easily seed profiles without users because of the foreign key constraint.
    // However, if we wanted to seed, we'd need to mock users first.
    // Since Replit Auth users are dynamic, we'll skip seeding profiles for now
    // or we could potentially create a dummy user in the users table if we really wanted to.
    console.log("Database is empty. Create a profile after logging in to see data.");
  }
}
