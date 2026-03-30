import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

export const clientSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
    cpf: z.string().min(11, 'CPF must be at least 11 digits').optional().or(z.literal('')),
    birth_date: z.string().optional().or(z.literal('')),
    latitude: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
    longitude: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  }),
});

export const osSchema = z.object({
  body: z.object({
    client_id: z.preprocess((val) => Number(val), z.number().positive()),
    service_id: z.preprocess((val) => (val ? Number(val) : undefined), z.number().positive().optional()),
    extra_service_id: z.preprocess((val) => (val ? Number(val) : undefined), z.number().positive().optional()),
    vehicle_id: z.preprocess((val) => (val ? Number(val) : undefined), z.number().positive().optional()),
    travel_cost: z.preprocess((val) => (val ? Number(val) : undefined), z.number().nonnegative().optional()),
    // Novo campo para IDs dos técnicos (opcional)
    technician_ids: z.preprocess(
      (val) => (typeof val === 'string' ? JSON.parse(val) : val), 
      z.array(z.number()).optional()
    ),
    description: z.string().min(5, 'Description is required'),
    latitude: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
    longitude: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
    hours_worked: z.preprocess((val) => (val ? Number(val) : undefined), z.number().nonnegative().optional()),
    final_price: z.preprocess((val) => (val ? Number(val) : undefined), z.number().nonnegative().optional()),
    final_technician_pay: z.preprocess((val) => (val ? Number(val) : undefined), z.number().nonnegative().optional()),
  }),
});
