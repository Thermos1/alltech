import { z } from 'zod/v4';

export const checkoutSchema = z.object({
  contactName: z
    .string()
    .min(2, 'Введите имя (минимум 2 символа)'),
  contactPhone: z
    .string()
    .min(10, 'Введите номер телефона')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Некорректный номер телефона'),
  deliveryAddress: z
    .string()
    .min(5, 'Введите адрес доставки'),
  deliveryNotes: z.string().optional(),
  promoCode: z.string().optional(),
  useBonuses: z.number().int().min(0).default(0),
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      productName: z.string(),
      variantLabel: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
      imageUrl: z.string().optional(),
    })
  ).min(1, 'Корзина пуста'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const promoValidateSchema = z.object({
  code: z.string().min(1, 'Введите промокод'),
  subtotal: z.number().min(0),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Минимум 2 символа').optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  inn: z.string().optional(),
});
