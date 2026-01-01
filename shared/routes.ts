import { z } from 'zod';
import { insertProfileSchema, profiles } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    list: {
      method: 'GET' as const,
      path: '/api/profiles',
      input: z.object({
        gender: z.string().optional(),
        denomination: z.string().optional(),
        minAge: z.coerce.number().optional(),
        maxAge: z.coerce.number().optional(),
        location: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof profiles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:id',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/profiles',
      input: insertProfileSchema,
      responses: {
        201: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profiles/:id',
      input: insertProfileSchema.partial(),
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/profiles/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export const phoneVerificationApi = {
  sendCode: {
    method: 'POST' as const,
    path: '/api/phone/send-code',
    input: z.object({
      phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    }),
    responses: {
      200: z.object({ success: z.boolean(), message: z.string() }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  verifyCode: {
    method: 'POST' as const,
    path: '/api/phone/verify-code',
    input: z.object({
      phoneNumber: z.string(),
      code: z.string().length(6, "Code must be 6 digits"),
      profileId: z.number().optional(),
    }),
    responses: {
      200: z.object({ success: z.boolean(), message: z.string() }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
