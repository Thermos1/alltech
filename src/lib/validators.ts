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

// Product CRUD schemas

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  slug: z.string().optional(),
  description: z.string().optional(),
  section: z.enum(['lubricants', 'filters']),
  brand_id: z.string().uuid('Выберите бренд'),
  category_id: z.string().uuid('Выберите категорию'),
  viscosity: z.string().optional(),
  base_type: z.string().optional(),
  api_spec: z.string().optional(),
  acea_spec: z.string().optional(),
  oem_approvals: z.string().optional(),
  oem_number: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = productCreateSchema.partial();

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export const variantCreateSchema = z.object({
  volume: z.string().min(1, 'Укажите объём'),
  unit: z.enum(['л', 'кг', 'шт']),
  price: z.number().positive('Цена должна быть больше 0'),
  price_per_liter: z.number().optional(),
  sku: z.string().optional(),
  stock_qty: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type VariantCreateInput = z.infer<typeof variantCreateSchema>;

export const variantUpdateSchema = variantCreateSchema.partial();

export type VariantUpdateInput = z.infer<typeof variantUpdateSchema>;
