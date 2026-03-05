'use client';

import { useState } from 'react';
import type { BadgeConfig } from '@/lib/card-templates';

const PRESETS: BadgeConfig[] = [
  { text: 'Хит', type: 'hit' },
  { text: 'Новинка', type: 'new' },
  { text: 'Акция', type: 'sale' },
];

type Props = {
  badges: BadgeConfig[];
  onChange: (badges: BadgeConfig[]) => void;
};

export default function BadgeEditor({ badges, onChange }: Props) {
  const [customText, setCustomText] = useState('');

  function addBadge(badge: BadgeConfig) {
    if (badges.length >= 3) return;
    onChange([...badges, badge]);
  }

  function removeBadge(index: number) {
    onChange(badges.filter((_, i) => i !== index));
  }

  function addCustom() {
    if (!customText.trim() || badges.length >= 3) return;
    addBadge({ text: customText.trim(), type: 'custom' });
    setCustomText('');
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-muted uppercase tracking-wider">Бейджи (макс. 3)</label>

      {/* Current badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-accent-magenta/20 text-accent-magenta text-xs px-2 py-1"
            >
              {badge.text}
              <button onClick={() => removeBadge(i)} className="hover:text-white">
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Preset badges */}
      {badges.length < 3 && (
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.text}
              onClick={() => addBadge(preset)}
              className="text-xs rounded-md px-2.5 py-1 bg-bg-card border border-border-subtle text-text-secondary hover:border-accent-yellow hover:text-text-primary transition-colors"
            >
              + {preset.text}
            </button>
          ))}
        </div>
      )}

      {/* Custom badge */}
      {badges.length < 3 && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            placeholder="Свой текст"
            maxLength={20}
            className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
          />
          <button
            onClick={addCustom}
            disabled={!customText.trim()}
            className="rounded-lg px-3 py-1.5 text-xs bg-bg-card border border-border-subtle text-text-secondary hover:border-accent-yellow disabled:opacity-40 transition-colors"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
