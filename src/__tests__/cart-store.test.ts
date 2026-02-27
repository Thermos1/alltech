import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/cart-store';

const mockItem = {
  variantId: 'v1',
  productId: 'p1',
  productName: 'ROLF Krafton P5 U 10W-40',
  variantLabel: '20 л',
  price: 5800,
  imageUrl: 'https://example.com/img.png',
};

const mockItem2 = {
  variantId: 'v2',
  productId: 'p2',
  productName: 'KIXX Grease EP2',
  variantLabel: '15 кг',
  price: 3200,
};

describe('cart-store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], _hydrated: false });
  });

  describe('addItem', () => {
    it('adds a new item with quantity 1', () => {
      useCartStore.getState().addItem(mockItem);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(1);
      expect(items[0].productName).toBe('ROLF Krafton P5 U 10W-40');
    });

    it('increments quantity for existing item', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('adds different items separately', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('removes item by variantId', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().removeItem('v1');
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].variantId).toBe('v2');
    });

    it('does nothing for non-existent variantId', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().removeItem('nonexistent');
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates quantity for item', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('v1', 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('removes item when quantity is 0', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('v1', 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('removes item when quantity is negative', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().updateQuantity('v1', -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('removes all items', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem2);
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('getTotal', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getTotal()).toBe(0);
    });

    it('calculates total correctly', () => {
      useCartStore.getState().addItem(mockItem); // 5800 x 1
      useCartStore.getState().addItem(mockItem2); // 3200 x 1
      expect(useCartStore.getState().getTotal()).toBe(9000);
    });

    it('accounts for quantity', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem); // 5800 x 2
      expect(useCartStore.getState().getTotal()).toBe(11600);
    });
  });

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0);
    });

    it('sums quantities across items', () => {
      useCartStore.getState().addItem(mockItem);
      useCartStore.getState().addItem(mockItem); // 2
      useCartStore.getState().addItem(mockItem2); // 1
      expect(useCartStore.getState().getItemCount()).toBe(3);
    });
  });
});
