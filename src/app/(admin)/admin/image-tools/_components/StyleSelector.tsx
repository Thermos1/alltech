'use client';

import { ALL_STYLES, type CardStyleId } from '@/lib/card-templates';

type Props = {
  value: CardStyleId;
  onChange: (style: CardStyleId) => void;
};

export default function StyleSelector({ value, onChange }: Props) {
  const styles = Object.values(ALL_STYLES);

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-muted uppercase tracking-wider">Стиль</label>
      <div className="grid grid-cols-2 gap-2">
        {styles.map((style) => {
          const isSelected = value === style.id;
          return (
            <button
              key={style.id}
              onClick={() => onChange(style.id)}
              className={`rounded-lg p-3 text-left transition-all border ${
                isSelected
                  ? 'border-accent-yellow ring-1 ring-accent-yellow'
                  : 'border-border-subtle hover:border-text-muted'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-5 h-5 rounded-full border border-white/10"
                  style={{
                    background: style.colors.backgroundEnd
                      ? `linear-gradient(135deg, ${style.colors.background}, ${style.colors.backgroundEnd})`
                      : style.colors.background,
                  }}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: style.colors.accent }}
                />
              </div>
              <div className="text-sm text-text-primary font-medium">{style.nameRu}</div>
              <div className="text-xs text-text-muted mt-0.5">{style.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
