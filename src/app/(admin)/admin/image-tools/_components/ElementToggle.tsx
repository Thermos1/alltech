'use client';

import type { CardElement } from '@/lib/card-templates';

const ELEMENT_LABELS: Record<CardElement, string> = {
  productName: 'Название товара',
  price: 'Цена',
  brandName: 'Бренд',
  viscosity: 'Вязкость',
  apiSpec: 'API спецификация',
  aceaSpec: 'ACEA спецификация',
  baseType: 'Тип базового масла',
  badges: 'Бейджи',
  watermark: 'Водяной знак',
  slideNumber: 'Нумерация',
};

type Props = {
  enabled: CardElement[];
  onChange: (elements: CardElement[]) => void;
};

export default function ElementToggle({ enabled, onChange }: Props) {
  function toggle(el: CardElement) {
    if (enabled.includes(el)) {
      onChange(enabled.filter((e) => e !== el));
    } else {
      onChange([...enabled, el]);
    }
  }

  const elements: CardElement[] = [
    'productName', 'price', 'brandName', 'viscosity',
    'apiSpec', 'aceaSpec', 'baseType', 'badges', 'watermark',
  ];

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-muted uppercase tracking-wider">Элементы</label>
      <div className="space-y-1">
        {elements.map((el) => (
          <label
            key={el}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-bg-card transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              checked={enabled.includes(el)}
              onChange={() => toggle(el)}
              className="rounded border-border-subtle bg-bg-secondary text-accent-yellow focus:ring-accent-yellow/30 w-4 h-4"
            />
            <span className="text-sm text-text-secondary">{ELEMENT_LABELS[el]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
