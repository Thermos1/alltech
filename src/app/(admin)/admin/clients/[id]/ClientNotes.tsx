'use client';

import { useState, useEffect } from 'react';

type Note = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
};

export default function ClientNotes({ clientId }: { clientId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/client-notes?clientId=${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotes(data);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/client-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, content: content.trim() }),
      });
      const note = await res.json();
      if (res.ok) {
        setNotes((prev) => [note, ...prev]);
        setContent('');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl bg-bg-card border border-border-subtle p-4">
      <h3 className="text-text-primary font-medium mb-3">Заметки</h3>

      {/* New note input */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Добавить заметку..."
          rows={2}
          className="flex-1 rounded-lg bg-bg-secondary border border-border-subtle px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-yellow focus:outline-none resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || saving}
          className="self-end rounded-lg bg-accent-yellow text-text-on-accent px-4 py-2 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {saving ? '...' : 'Добавить'}
        </button>
      </div>

      {/* Notes list */}
      {loading ? (
        <p className="text-text-muted text-xs">Загрузка...</p>
      ) : notes.length === 0 ? (
        <p className="text-text-muted text-xs">Заметок пока нет</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg bg-bg-secondary p-3">
              <p className="text-text-primary text-sm whitespace-pre-wrap">{note.content}</p>
              <div className="flex gap-3 mt-2 text-[11px] text-text-muted">
                <span>{note.author_name}</span>
                <span>
                  {new Date(note.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
