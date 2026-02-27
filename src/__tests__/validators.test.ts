import { describe, it, expect } from 'vitest';
import {
  checkoutSchema,
  promoValidateSchema,
  profileUpdateSchema,
} from '@/lib/validators';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

const validCheckout = {
  contactName: 'Иван Иванов',
  contactPhone: '+7 900 000-00-01',
  deliveryAddress: 'г. Якутск, ул. Ленина, д. 1',
  items: [
    {
      variantId: validUUID,
      productName: 'ROLF Krafton P5 U 10W-40',
      variantLabel: '20 л',
      quantity: 2,
      price: 5800,
    },
  ],
};

describe('checkoutSchema', () => {
  it('validates correct checkout data', () => {
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, contactName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects short name', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, contactName: 'И' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, contactPhone: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects short address', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, deliveryAddress: 'дом' });
    expect(result.success).toBe(false);
  });

  it('rejects empty items', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, items: [] });
    expect(result.success).toBe(false);
  });

  it('rejects item with quantity 0', () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      items: [{ ...validCheckout.items[0], quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects item with negative price', () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      items: [{ ...validCheckout.items[0], price: -100 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      deliveryNotes: 'Позвонить за час',
      promoCode: 'WELCOME10',
      useBonuses: 500,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative bonuses', () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      useBonuses: -100,
    });
    expect(result.success).toBe(false);
  });

  it('defaults useBonuses to 0', () => {
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.useBonuses).toBe(0);
    }
  });

  it('rejects non-uuid variant ID', () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      items: [{ ...validCheckout.items[0], variantId: 'not-a-uuid' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('promoValidateSchema', () => {
  it('validates correct promo input', () => {
    const result = promoValidateSchema.safeParse({ code: 'WELCOME10', subtotal: 5000 });
    expect(result.success).toBe(true);
  });

  it('rejects empty code', () => {
    const result = promoValidateSchema.safeParse({ code: '', subtotal: 5000 });
    expect(result.success).toBe(false);
  });

  it('rejects negative subtotal', () => {
    const result = promoValidateSchema.safeParse({ code: 'CODE', subtotal: -1 });
    expect(result.success).toBe(false);
  });
});

describe('profileUpdateSchema', () => {
  it('validates full profile update', () => {
    const result = profileUpdateSchema.safeParse({
      fullName: 'Иван Иванов',
      phone: '+79001234567',
      companyName: 'ООО АЛТЕХ',
      inn: '1400013380',
    });
    expect(result.success).toBe(true);
  });

  it('validates partial update', () => {
    const result = profileUpdateSchema.safeParse({ fullName: 'Иван' });
    expect(result.success).toBe(true);
  });

  it('validates empty update', () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects too short name', () => {
    const result = profileUpdateSchema.safeParse({ fullName: 'И' });
    expect(result.success).toBe(false);
  });
});
