import { describe, it, expect } from 'vitest';
import {
  productCreateSchema,
  productUpdateSchema,
  variantCreateSchema,
  variantUpdateSchema,
} from '@/lib/validators';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

const validProduct = {
  name: 'ROLF GT SAE 5W-40',
  section: 'lubricants' as const,
  brand_id: validUUID,
  category_id: validUUID,
};

describe('productCreateSchema', () => {
  it('validates correct product data', () => {
    const result = productCreateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = productCreateSchema.safeParse({ ...validProduct, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = productCreateSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid section', () => {
    const result = productCreateSchema.safeParse({ ...validProduct, section: 'other' });
    expect(result.success).toBe(false);
  });

  it('accepts lubricants section', () => {
    const result = productCreateSchema.safeParse({ ...validProduct, section: 'lubricants' });
    expect(result.success).toBe(true);
  });

  it('accepts filters section', () => {
    const result = productCreateSchema.safeParse({ ...validProduct, section: 'filters' });
    expect(result.success).toBe(true);
  });

  it('rejects non-uuid brand_id', () => {
    const result = productCreateSchema.safeParse({ ...validProduct, brand_id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects non-uuid category_id', () => {
    const result = productCreateSchema.safeParse({ ...validProduct, category_id: 'bad' });
    expect(result.success).toBe(false);
  });

  it('defaults is_active to true', () => {
    const result = productCreateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_active).toBe(true);
    }
  });

  it('defaults is_featured to false', () => {
    const result = productCreateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_featured).toBe(false);
    }
  });

  it('accepts all optional fields', () => {
    const result = productCreateSchema.safeParse({
      ...validProduct,
      slug: 'rolf-gt-5w40',
      description: 'Полностью синтетическое моторное масло',
      viscosity: '5W-40',
      base_type: 'synthetic',
      api_spec: 'SN/CF',
      acea_spec: 'A3/B4',
      approvals: 'MB 229.5',
      oem_codes: 'A000 989 69 01',
      is_active: false,
      is_featured: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required name', () => {
    const { name: _, ...noName } = validProduct;
    const result = productCreateSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it('rejects missing required section', () => {
    const { section: _, ...noSection } = validProduct;
    const result = productCreateSchema.safeParse(noSection);
    expect(result.success).toBe(false);
  });

  it('rejects missing required brand_id', () => {
    const { brand_id: _, ...noBrand } = validProduct;
    const result = productCreateSchema.safeParse(noBrand);
    expect(result.success).toBe(false);
  });
});

describe('productUpdateSchema', () => {
  it('validates partial update (name only)', () => {
    const result = productUpdateSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('validates empty update', () => {
    const result = productUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('validates full update', () => {
    const result = productUpdateSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('still validates field constraints', () => {
    const result = productUpdateSchema.safeParse({ name: 'A' });
    expect(result.success).toBe(false);
  });

  it('still validates section enum', () => {
    const result = productUpdateSchema.safeParse({ section: 'invalid' });
    expect(result.success).toBe(false);
  });
});

const validVariant = {
  volume: '4',
  unit: 'л' as const,
  price: 2500,
};

describe('variantCreateSchema', () => {
  it('validates correct variant data', () => {
    const result = variantCreateSchema.safeParse(validVariant);
    expect(result.success).toBe(true);
  });

  it('rejects empty volume', () => {
    const result = variantCreateSchema.safeParse({ ...validVariant, volume: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid unit', () => {
    const result = variantCreateSchema.safeParse({ ...validVariant, unit: 'мл' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid units', () => {
    for (const unit of ['л', 'кг', 'шт']) {
      const result = variantCreateSchema.safeParse({ ...validVariant, unit });
      expect(result.success).toBe(true);
    }
  });

  it('rejects zero price', () => {
    const result = variantCreateSchema.safeParse({ ...validVariant, price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = variantCreateSchema.safeParse({ ...validVariant, price: -100 });
    expect(result.success).toBe(false);
  });

  it('defaults stock_qty to 0', () => {
    const result = variantCreateSchema.safeParse(validVariant);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stock_qty).toBe(0);
    }
  });

  it('defaults is_active to true', () => {
    const result = variantCreateSchema.safeParse(validVariant);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_active).toBe(true);
    }
  });

  it('rejects negative stock_qty', () => {
    const result = variantCreateSchema.safeParse({ ...validVariant, stock_qty: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer stock_qty', () => {
    const result = variantCreateSchema.safeParse({ ...validVariant, stock_qty: 1.5 });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = variantCreateSchema.safeParse({
      ...validVariant,
      price_per_liter: 625,
      sku: 'ROLF-GT-5W40-4L',
      stock_qty: 50,
      is_active: false,
    });
    expect(result.success).toBe(true);
  });
});

describe('variantUpdateSchema', () => {
  it('validates partial update', () => {
    const result = variantUpdateSchema.safeParse({ price: 3000 });
    expect(result.success).toBe(true);
  });

  it('validates empty update', () => {
    const result = variantUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('still validates price constraint', () => {
    const result = variantUpdateSchema.safeParse({ price: -1 });
    expect(result.success).toBe(false);
  });
});
