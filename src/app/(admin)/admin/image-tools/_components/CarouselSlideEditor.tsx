'use client';

import type { CarouselSlideType } from '@/lib/card-templates/carousel';

type Props = {
  slideType: CarouselSlideType;
  slideTitle: string;
  // Carousel-wide data
  benefits: string[];
  onBenefitsChange: (v: string[]) => void;
  compatibility: string[];
  onCompatibilityChange: (v: string[]) => void;
  volumes: { volume: string; price: number }[];
  onVolumesChange: (v: { volume: string; price: number }[]) => void;
  changeInterval: string;
  onChangeIntervalChange: (v: string) => void;
  storageConditions: string;
  onStorageConditionsChange: (v: string) => void;
  certifications: string[];
  onCertificationsChange: (v: string[]) => void;
};

export default function CarouselSlideEditor(props: Props) {
  const { slideType, slideTitle } = props;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-primary">
        {slideTitle || 'Обложка'}
      </h3>

      {slideType === 'cover' && (
        <p className="text-xs text-text-muted">
          Обложка автоматически использует фото товара, название и вязкость из данных товара.
        </p>
      )}

      {slideType === 'specs' && (
        <p className="text-xs text-text-muted">
          Характеристики берутся из данных товара (API, ACEA, тип базы, допуски).
        </p>
      )}

      {slideType === 'benefits' && (
        <EditableList
          items={props.benefits}
          onChange={props.onBenefitsChange}
          placeholder="Новое преимущество"
          maxItems={6}
        />
      )}

      {slideType === 'compatibility' && (
        <EditableList
          items={props.compatibility}
          onChange={props.onCompatibilityChange}
          placeholder="Марка техники"
          maxItems={10}
        />
      )}

      {slideType === 'volumes' && (
        <VolumeEditor
          volumes={props.volumes}
          onChange={props.onVolumesChange}
        />
      )}

      {slideType === 'usage' && (
        <div className="space-y-2">
          <input
            type="text"
            value={props.changeInterval}
            onChange={(e) => props.onChangeIntervalChange(e.target.value)}
            placeholder="Интервал замены (напр. 10 000 км)"
            className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
          />
          <input
            type="text"
            value={props.storageConditions}
            onChange={(e) => props.onStorageConditionsChange(e.target.value)}
            placeholder="Условия хранения"
            className="w-full rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
          />
        </div>
      )}

      {slideType === 'trust' && (
        <EditableList
          items={props.certifications}
          onChange={props.onCertificationsChange}
          placeholder="Сертификат/допуск"
          maxItems={6}
        />
      )}
    </div>
  );
}

function EditableList({
  items,
  onChange,
  placeholder,
  maxItems,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  maxItems: number;
}) {
  function updateItem(index: number, value: string) {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    if (items.length >= maxItems) return;
    onChange([...items, '']);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
          />
          <button
            onClick={() => removeItem(i)}
            className="px-2 text-text-muted hover:text-accent-magenta transition-colors"
          >
            &times;
          </button>
        </div>
      ))}
      {items.length < maxItems && (
        <button
          onClick={addItem}
          className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
        >
          + Добавить
        </button>
      )}
    </div>
  );
}

function VolumeEditor({
  volumes,
  onChange,
}: {
  volumes: { volume: string; price: number }[];
  onChange: (v: { volume: string; price: number }[]) => void;
}) {
  function updateVolume(index: number, field: 'volume' | 'price', value: string | number) {
    const newVolumes = [...volumes];
    newVolumes[index] = { ...newVolumes[index], [field]: value };
    onChange(newVolumes);
  }

  function removeVolume(index: number) {
    onChange(volumes.filter((_, i) => i !== index));
  }

  function addVolume() {
    if (volumes.length >= 8) return;
    onChange([...volumes, { volume: '', price: 0 }]);
  }

  return (
    <div className="space-y-2">
      {volumes.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={v.volume}
            onChange={(e) => updateVolume(i, 'volume', e.target.value)}
            placeholder="Объём (напр. 4л)"
            className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
          />
          <input
            type="number"
            value={v.price || ''}
            onChange={(e) => updateVolume(i, 'price', Number(e.target.value))}
            placeholder="Цена"
            className="w-24 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none"
          />
          <button
            onClick={() => removeVolume(i)}
            className="px-2 text-text-muted hover:text-accent-magenta transition-colors"
          >
            &times;
          </button>
        </div>
      ))}
      {volumes.length < 8 && (
        <button
          onClick={addVolume}
          className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
        >
          + Добавить объём
        </button>
      )}
    </div>
  );
}
