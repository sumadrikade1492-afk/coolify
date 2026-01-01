import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api, phoneVerificationApi } from "@shared/routes";
import { z } from "zod";
import { generateVerificationCode, sendVerificationSMS, isTwilioConfigured } from "./twilio";
import { sendProfileNotification, sendDailyLoginReport } from "./gmail";

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
        country: req.query.country as string,
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
      
      // Check if phone was verified before creating profile
      let phoneVerified = false;
      if (input.phoneNumber) {
        phoneVerified = await storage.isPhoneVerifiedForUser(userId, input.phoneNumber);
        if (phoneVerified) {
          await storage.consumePhoneVerification(userId, input.phoneNumber);
        }
      }
      
      const profile = await storage.createProfile(userId, input, phoneVerified);
      
      // Send email notification
      try {
        await sendProfileNotification('created', profile.id, {
          firstName: profile.firstName,
          lastName: profile.lastName,
          gender: profile.gender,
          city: profile.city,
          country: profile.country,
          denomination: profile.denomination,
        });
      } catch (emailError) {
        console.error('Failed to send profile creation email:', emailError);
      }
      
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

      // Authorization check: Ensure user owns the profile OR is admin
      const isAdmin = await storage.isUserAdmin(userId);
      if (existing.userId !== userId && !isAdmin) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const input = api.profiles.update.input.parse(req.body);
      const updated = await storage.updateProfile(profileId, input);
      
      // Send email notification
      try {
        await sendProfileNotification('updated', updated.id, {
          firstName: updated.firstName,
          lastName: updated.lastName,
          gender: updated.gender,
          city: updated.city,
          country: updated.country,
          denomination: updated.denomination,
        });
      } catch (emailError) {
        console.error('Failed to send profile update email:', emailError);
      }
      
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

  // Phone Verification Routes (require authentication for security)
  app.post(phoneVerificationApi.sendCode.path, isAuthenticated, async (req, res) => {
    try {
      if (!isTwilioConfigured()) {
        return res.status(500).json({ message: "Phone verification is not configured" });
      }

      const userId = (req.user as any).claims.sub;
      const input = phoneVerificationApi.sendCode.input.parse(req.body);
      const code = generateVerificationCode();
      
      await storage.createPhoneVerification(userId, input.phoneNumber, code);
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

  app.post(phoneVerificationApi.verifyCode.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = phoneVerificationApi.verifyCode.input.parse(req.body);
      const verified = await storage.verifyPhoneCode(userId, input.phoneNumber, input.code);

      if (!verified) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
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

  // Admin Routes
  
  // Get all profiles (admin only)
  app.get("/api/admin/profiles", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const profiles = await storage.getProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Set user as admin (admin only - for initial setup, first user can use SQL)
  app.post("/api/admin/set-admin", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { targetUserId, setAdmin } = req.body;
      await storage.setUserAdmin(targetUserId, setAdmin);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Manually trigger daily login report (admin only)
  app.post("/api/admin/send-login-report", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const isAdmin = await storage.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const logins = await storage.getTodaysLogins();
      await sendDailyLoginReport(logins.map(l => ({
        userId: l.userId,
        username: l.username || 'Unknown',
        loginTime: l.loginTime || new Date(),
      })));
      res.json({ success: true, message: "Login report sent" });
    } catch (error) {
      console.error("Failed to send login report:", error);
      res.status(500).json({ message: "Failed to send login report" });
    }
  });

  // Seed Data
  await seedDatabase();
  
  // Schedule daily login report at midnight
  scheduleDailyLoginReport();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getProfiles();
  if (existing.length === 0) {
    console.log("Database is empty. Create a profile after logging in to see data.");
  }
}

// Schedule daily login report at midnight
function scheduleDailyLoginReport() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next midnight
  
  const msUntilMidnight = midnight.getTime() - now.getTime();
  
  // Schedule first run at midnight
  setTimeout(async () => {
    await sendLoginReport();
    // Then run every 24 hours
    setInterval(sendLoginReport, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  
  console.log(`Daily login report scheduled. First report will be sent at midnight (in ${Math.round(msUntilMidnight / 1000 / 60)} minutes).`);
}

async function sendLoginReport() {
  try {
    // Get yesterday's logins (since this runs at midnight, we want the previous day)
    const logins = await storage.getYesterdaysLogins();
    await sendDailyLoginReport(logins.map(l => ({
      userId: l.userId,
      username: l.username || 'Unknown',
      loginTime: l.loginTime || new Date(),
    })));
    console.log(`Daily login report sent with ${logins.length} logins from yesterday.`);
  } catch (error) {
    console.error("Failed to send daily login report:", error);
  }
}
