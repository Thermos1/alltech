'use client';

import { PLATFORM_PRESETS, type ExportPlatform } from '@/lib/card-templates';

type Props = {
  value: ExportPlatform;
  onChange: (platform: ExportPlatform) => void;
  customWidth?: number;
  customHeight?: number;
  onCustomSize?: (w: number, h: number) => void;
};

export default function PlatformSelector({ value, onChange, customWidth, customHeight, onCustomSize }: Props) {
  const platforms = Object.entries(PLATFORM_PRESETS) as [ExportPlatform, (typeof PLATFORM_PRESETS)[ExportPlatform]][];

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-muted uppercase tracking-wider">Платформа</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ExportPlatform)}
        className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
      >
        {platforms.map(([id, preset]) => (
          <option key={id} value={id}>
            {preset.label}
          </option>
        ))}
      </select>

      {value === 'custom' && onCustomSize && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-text-muted">Ширина</label>
            <input
              type="number"
              min={200}
              max={4000}
              value={customWidth || 1080}
              onChange={(e) => onCustomSize(Number(e.target.value), customHeight || 1080)}
              className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-text-muted">Высота</label>
            <input
              type="number"
              min={200}
              max={4000}
              value={customHeight || 1080}
              onChange={(e) => onCustomSize(customWidth || 1080, Number(e.target.value))}
              className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-1.5 text-sm text-text-primary focus:border-accent-yellow focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
