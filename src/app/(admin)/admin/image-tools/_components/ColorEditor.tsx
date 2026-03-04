'use client';

import { useState } from 'react';
import type { CardStyleColors } from '@/lib/card-templates';

type EditableColor = 'background' | 'text' | 'accent' | 'specBg' | 'badgeBg';

const COLOR_LABELS: Record<EditableColor, string> = {
  background: 'Фон',
  text: 'Текст',
  accent: 'Акцент',
  specBg: 'Плашки',
  badgeBg: 'Бейджи',
};

type Props = {
  baseColors: CardStyleColors;
  customColors: Partial<CardStyleColors>;
  onChange: (colors: Partial<CardStyleColors>) => void;
};

export default function ColorEditor({ baseColors, customColors, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const editableKeys: EditableColor[] = ['background', 'text', 'accent', 'specBg', 'badgeBg'];

  function getColor(key: EditableColor): string {
    const val = customColors[key] || baseColors[key];
    // Convert rgba/named to hex for color input (fallback)
    if (val.startsWith('#') && val.length <= 7) return val;
    return val.startsWith('#') ? val.slice(0, 7) : '#000000';
  }

  function setColor(key: EditableColor, value: string) {
    onChange({ ...customColors, [key]: value });
  }

  function reset() {
    onChange({});
  }

  const hasCustom = Object.keys(customColors).length > 0;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-text-muted hover:text-accent-cyan transition-colors"
      >
        <span>{open ? '▾' : '▸'}</span>
        Настроить цвета
        {hasCustom && <span className="w-2 h-2 rounded-full bg-accent-cyan" />}
      </button>

      {open && (
        <div className="space-y-2 rounded-lg bg-bg-secondary border border-border-subtle p-3">
          {editableKeys.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <input
                type="color"
                value={getColor(key)}
                onChange={(e) => setColor(key, e.target.value)}
                className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
              />
              <span className="text-xs text-text-secondary flex-1">{COLOR_LABELS[key]}</span>
            </div>
          ))}
          {hasCustom && (
            <button
              onClick={reset}
              className="text-xs text-text-muted hover:text-accent-magenta transition-colors mt-1"
            >
              Сбросить цвета
            </button>
          )}
        </div>
      )}
    </div>
  );
}
