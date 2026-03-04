import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';

// Mock @/lib/card-templates with all exports needed by child components
vi.mock('@/lib/card-templates', () => ({
  ALL_STYLES: {
    minimalist: { id: 'minimalist', nameRu: 'Минимализм', description: '', colors: { background: '#fff', text: '#000', accent: '#333', textSecondary: '#666', specBg: '#eee', specText: '#333', badgeBg: '#000', badgeText: '#fff', watermarkColor: '#000' }, fonts: { heading: 'Dela Gothic One', body: 'Golos Text' } },
    'premium-dark': { id: 'premium-dark', nameRu: 'Премиум', description: '', colors: { background: '#0a0a0f', text: '#fff', accent: '#ffd600', textSecondary: '#999', specBg: '#1a1a2e', specText: '#ccc', badgeBg: '#ffd600', badgeText: '#000', watermarkColor: '#fff' }, fonts: { heading: 'Dela Gothic One', body: 'Golos Text' } },
    gradient: { id: 'gradient', nameRu: 'Градиент', description: '', colors: { background: '#1a1a2e', text: '#fff', accent: '#00e5ff', textSecondary: '#aaa', specBg: '#2a2a4e', specText: '#ddd', badgeBg: '#00e5ff', badgeText: '#000', watermarkColor: '#fff' }, fonts: { heading: 'Dela Gothic One', body: 'Golos Text' } },
    retro: { id: 'retro', nameRu: 'Ретро', description: '', colors: { background: '#f5f0e1', text: '#2d2d2d', accent: '#c0392b', textSecondary: '#666', specBg: '#e0dac8', specText: '#333', badgeBg: '#c0392b', badgeText: '#fff', watermarkColor: '#2d2d2d' }, fonts: { heading: 'Dela Gothic One', body: 'Golos Text' } },
  },
  PLATFORM_PRESETS: {
    'wb-ozon': { width: 900, height: 1200, format: 'jpg', label: 'WB / Ozon (900×1200)' },
    instagram: { width: 1080, height: 1350, format: 'png', label: 'Instagram / LinkedIn (1080×1350)' },
    shopify: { width: 2048, height: 2048, format: 'png', label: 'Shopify (2048×2048)' },
    'telegram-vk': { width: 1080, height: 1080, format: 'png', label: 'Telegram / VK (1080×1080)' },
    tiktok: { width: 1080, height: 1920, format: 'png', label: 'TikTok (1080×1920)' },
    pinterest: { width: 1000, height: 1500, format: 'png', label: 'Pinterest (1000×1500)' },
    custom: { width: 1080, height: 1080, format: 'png', label: 'Свой размер' },
  },
}));

const { default: AiGenerator } = await import(
  '@/app/(admin)/admin/image-tools/_components/AiGenerator'
);

describe('AiGenerator component', () => {
  const defaultProps = {
    slideBuffer: [] as { id: string; dataUrl: string; source: 'card' | 'upload'; label: string; included: boolean }[],
    onAddToBuffer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  // --- Phase: Input ---

  it('renders input phase by default', () => {
    render(createElement(AiGenerator, defaultProps));
    expect(screen.getByText('Что создать?')).toBeInTheDocument();
    expect(screen.getByText('Создать план с AI')).toBeInTheDocument();
  });

  it('renders prompt textarea with placeholder', () => {
    render(createElement(AiGenerator, defaultProps));
    const textarea = screen.getByPlaceholderText(/Опишите что хотите создать/);
    expect(textarea).toBeInTheDocument();
  });

  it('shows photos count label', () => {
    render(createElement(AiGenerator, defaultProps));
    expect(screen.getByText('Фотографии (0)')).toBeInTheDocument();
  });

  it('shows upload button', () => {
    render(createElement(AiGenerator, defaultProps));
    expect(screen.getByText('+ Загрузить')).toBeInTheDocument();
  });

  it('shows drop zone when no images', () => {
    render(createElement(AiGenerator, defaultProps));
    expect(screen.getByText(/Перетащите фото или нажмите для выбора/)).toBeInTheDocument();
  });

  it('disables create plan button when prompt is empty', () => {
    render(createElement(AiGenerator, defaultProps));
    const btn = screen.getByText('Создать план с AI');
    expect(btn).toBeDisabled();
  });

  it('enables create plan button when prompt has text', () => {
    render(createElement(AiGenerator, defaultProps));
    const textarea = screen.getByPlaceholderText(/Опишите что хотите создать/);
    fireEvent.change(textarea, { target: { value: 'Test prompt' } });
    const btn = screen.getByText('Создать план с AI');
    expect(btn).not.toBeDisabled();
  });

  it('disables create plan button with whitespace-only prompt', () => {
    render(createElement(AiGenerator, defaultProps));
    const textarea = screen.getByPlaceholderText(/Опишите что хотите создать/);
    fireEvent.change(textarea, { target: { value: '   ' } });
    const btn = screen.getByText('Создать план с AI');
    expect(btn).toBeDisabled();
  });

  it('renders buffer items when slideBuffer is provided', () => {
    const props = {
      ...defaultProps,
      slideBuffer: [
        { id: 'buf-1', dataUrl: 'data:image/png;base64,abc', source: 'card' as const, label: 'Card 1', included: true },
      ],
    };
    render(createElement(AiGenerator, props));
    expect(screen.getByText('Из буфера:')).toBeInTheDocument();
  });

  it('has hidden file input with correct accept types', () => {
    render(createElement(AiGenerator, defaultProps));
    const input = document.querySelector('input[type="file"][accept="image/jpeg,image/png,image/webp"]');
    expect(input).toBeTruthy();
  });

  it('renders style and platform selectors', () => {
    render(createElement(AiGenerator, defaultProps));
    expect(screen.getByText('Стиль')).toBeInTheDocument();
    expect(screen.getByText('Платформа')).toBeInTheDocument();
  });

  // --- Phase: Planning ---

  it('shows planning loading state when creating plan', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(screen.getByText('AI составляет план слайдов...')).toBeInTheDocument();
      expect(screen.getByText('Обычно 5–15 секунд')).toBeInTheDocument();
    });
  });

  // --- Phase: Plan ---

  it('transitions to plan phase on successful AI response', async () => {
    const mockPlan = {
      slides: [
        { type: 'title', heading: 'Test Title', body: 'Subtitle' },
        { type: 'text-only', heading: 'Slide 2', body: 'Content' },
      ],
      style: 'premium-dark',
      productData: { name: 'Test Product' },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlan),
    }));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'Create carousel' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(screen.getByText(/AI составил план: 2 слайдов/)).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('shows editable slides in plan phase', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        slides: [{ type: 'title', heading: 'My Title' }, { type: 'benefits', heading: 'Benefits', items: ['Fast'] }],
        style: 'minimalist',
      }),
    }));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(screen.getByText('Изменить запрос')).toBeInTheDocument();
      expect(screen.getByText('+ Добавить слайд')).toBeInTheDocument();
    });
  });

  it('shows generate and PDF buttons in plan phase', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
    }));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(screen.getByText(/Сгенерировать 1 слайдов/)).toBeInTheDocument();
      expect(screen.getByText('Скачать PDF (LinkedIn)')).toBeInTheDocument();
    });
  });

  it('handles back to input from plan phase', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
    }));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => expect(screen.getByText('Изменить запрос')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Изменить запрос'));

    await waitFor(() => expect(screen.getByText('Что создать?')).toBeInTheDocument());
  });

  // --- Error handling ---

  it('shows error on 503 (ANTHROPIC_API_KEY not set)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: 'ANTHROPIC_API_KEY not set' }),
    }));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(screen.getByText(/ANTHROPIC_API_KEY не настроен/)).toBeInTheDocument();
    });
  });

  it('shows error on non-503 API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad request' }),
    }));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(screen.getByText('Bad request')).toBeInTheDocument();
    });
  });

  it('shows error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('dismisses error when clicking close button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Test error')));

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => expect(screen.getByText('Test error')).toBeInTheDocument());

    fireEvent.click(screen.getByText('\u00d7'));

    await waitFor(() => expect(screen.queryByText('Test error')).not.toBeInTheDocument());
  });

  // --- Phase: Done ---

  it('transitions to done phase with generated images', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          images: [{ slideNumber: 1, dataUrl: 'data:image/png;base64,abc' }],
        }),
      }),
    );

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));
    await waitFor(() => screen.getByText(/Сгенерировать/));
    fireEvent.click(screen.getByText(/Сгенерировать/));

    await waitFor(() => {
      expect(screen.getByText(/Готово: 1 слайдов/)).toBeInTheDocument();
    });
  });

  it('shows action buttons in done phase', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          images: [{ slideNumber: 1, dataUrl: 'data:image/png;base64,abc' }],
        }),
      }),
    );

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));
    await waitFor(() => screen.getByText(/Сгенерировать/));
    fireEvent.click(screen.getByText(/Сгенерировать/));

    await waitFor(() => {
      expect(screen.getByText('Скачать все PNG')).toBeInTheDocument();
      expect(screen.getByText('Скачать PDF')).toBeInTheDocument();
      expect(screen.getByText('Добавить все в буфер')).toBeInTheDocument();
      expect(screen.getByText('Редактировать план')).toBeInTheDocument();
      expect(screen.getByText('Новый запрос')).toBeInTheDocument();
    });
  });

  it('calls onAddToBuffer when adding all to buffer', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          images: [
            { slideNumber: 1, dataUrl: 'data:image/png;base64,slide1' },
            { slideNumber: 2, dataUrl: 'data:image/png;base64,slide2' },
          ],
        }),
      }),
    );

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));
    await waitFor(() => screen.getByText(/Сгенерировать/));
    fireEvent.click(screen.getByText(/Сгенерировать/));
    await waitFor(() => screen.getByText('Добавить все в буфер'));

    fireEvent.click(screen.getByText('Добавить все в буфер'));

    expect(defaultProps.onAddToBuffer).toHaveBeenCalledTimes(2);
    expect(defaultProps.onAddToBuffer).toHaveBeenCalledWith('data:image/png;base64,slide1', 'AI Слайд 1');
    expect(defaultProps.onAddToBuffer).toHaveBeenCalledWith('data:image/png;base64,slide2', 'AI Слайд 2');
  });

  // --- Generating phase ---

  it('shows generating loading state', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
      })
      .mockReturnValueOnce(new Promise(() => {})),
    );

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));
    await waitFor(() => screen.getByText(/Сгенерировать/));
    fireEvent.click(screen.getByText(/Сгенерировать/));

    await waitFor(() => {
      expect(screen.getByText(/Генерирую 1 слайдов/)).toBeInTheDocument();
      expect(screen.getByText('Может занять 10–30 секунд')).toBeInTheDocument();
    });
  });

  it('handles back to plan from done phase', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ images: [{ slideNumber: 1, dataUrl: 'abc' }] }),
      }),
    );

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'test' } });
    fireEvent.click(screen.getByText('Создать план с AI'));
    await waitFor(() => screen.getByText(/Сгенерировать/));
    fireEvent.click(screen.getByText(/Сгенерировать/));
    await waitFor(() => screen.getByText('Редактировать план'));

    fireEvent.click(screen.getByText('Редактировать план'));

    await waitFor(() => {
      expect(screen.getByText(/AI составил план/)).toBeInTheDocument();
      expect(screen.getByText(/Сгенерировать/)).toBeInTheDocument();
    });
  });

  it('sends correct payload to AI plan API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ slides: [{ type: 'title', heading: 'X' }], style: 'minimalist' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(createElement(AiGenerator, defaultProps));
    fireEvent.change(screen.getByPlaceholderText(/Опишите что хотите создать/), { target: { value: 'Карусель для WB' } });
    fireEvent.click(screen.getByText('Создать план с AI'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/cards/ai-plan', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.prompt).toBe('Карусель для WB');
      expect(body.imageCount).toBe(0);
      expect(body.style).toBe('premium-dark');
      expect(body.platform).toBe('instagram');
    });
  });
});
