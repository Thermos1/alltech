import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockServerFrom = vi.fn();
const mockAdminFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockServerFrom,
    }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}));

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

const { GET, POST } = await import('@/app/api/admin/client-notes/route');

function createGetRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/admin/client-notes');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const req = new Request(url.toString(), { method: 'GET' });
  // NextRequest has nextUrl with searchParams — polyfill for tests
  (req as Record<string, unknown>).nextUrl = url;
  return req as unknown as import('next/server').NextRequest;
}

function createPostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/admin/client-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/admin/client-notes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    });
    // Default: admin role
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
        }),
      }),
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET(createGetRequest({ clientId: 'c1' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });
    const res = await GET(createGetRequest({ clientId: 'c1' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when clientId is missing', async () => {
    const res = await GET(createGetRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('clientId required');
  });

  it('returns 403 when manager accesses notes for other managers clients', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    // admin.from('profiles') for manager check — client belongs to different manager
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { manager_id: 'other-manager' }, error: null }),
        }),
      }),
    });

    const res = await GET(createGetRequest({ clientId: 'c1' }));
    expect(res.status).toBe(403);
  });

  it('returns notes successfully for admin', async () => {
    const mockNotes = [
      { id: 'n1', content: 'Note 1', created_at: '2026-01-02T00:00:00Z', author_id: 'admin-user' },
      { id: 'n2', content: 'Note 2', created_at: '2026-01-01T00:00:00Z', author_id: 'manager-1' },
    ];
    const mockAuthors = [
      { id: 'admin-user', full_name: 'Admin User' },
      { id: 'manager-1', full_name: 'Manager One' },
    ];

    let adminCallCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'client_notes') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockNotes, error: null }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        // Second call: fetch author profiles by IDs
        adminCallCount++;
        return {
          select: () => ({
            in: () => Promise.resolve({ data: mockAuthors, error: null }),
          }),
        };
      }
      return {};
    });

    const res = await GET(createGetRequest({ clientId: 'c1' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].author_name).toBe('Admin User');
    expect(data[1].author_name).toBe('Manager One');
    expect(data[0].content).toBe('Note 1');
  });

  it('returns empty array when no notes exist', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'client_notes') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GET(createGetRequest({ clientId: 'c1' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('returns notes successfully for manager viewing own clients', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });

    const mockNotes = [
      { id: 'n1', content: 'Manager note', created_at: '2026-01-01T00:00:00Z', author_id: 'admin-user' },
    ];

    let profileCallCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        profileCallCount++;
        if (profileCallCount === 1) {
          // First profiles call: manager ownership check
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { manager_id: 'admin-user' }, error: null }),
              }),
            }),
          };
        }
        // Second profiles call: author names
        return {
          select: () => ({
            in: () => Promise.resolve({ data: [{ id: 'admin-user', full_name: 'Admin User' }], error: null }),
          }),
        };
      }
      if (table === 'client_notes') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockNotes, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await GET(createGetRequest({ clientId: 'c1' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].author_name).toBe('Admin User');
  });
});

describe('POST /api/admin/client-notes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-user' } },
      error: null,
    });
    // Default: admin role
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
        }),
      }),
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(createPostRequest({ clientId: 'c1', content: 'test' }) as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 for customer role', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'customer' }, error: null }),
        }),
      }),
    });
    const res = await POST(createPostRequest({ clientId: 'c1', content: 'test' }) as never);
    expect(res.status).toBe(403);
  });

  it('returns 400 when clientId is missing', async () => {
    const res = await POST(createPostRequest({ content: 'test' }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('clientId and content required');
  });

  it('returns 400 when content is empty string', async () => {
    const res = await POST(createPostRequest({ clientId: 'c1', content: '   ' }) as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('clientId and content required');
  });

  it('returns 400 when content is missing', async () => {
    const res = await POST(createPostRequest({ clientId: 'c1' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 403 when manager adds notes to other managers clients', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });
    // admin.from('profiles') — client belongs to different manager
    mockAdminFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { manager_id: 'other-manager' }, error: null }),
        }),
      }),
    });

    const res = await POST(createPostRequest({ clientId: 'c1', content: 'note' }) as never);
    expect(res.status).toBe(403);
  });

  it('creates note successfully for admin', async () => {
    const mockNote = {
      id: 'note-1',
      content: 'Test note',
      created_at: '2026-01-01T00:00:00Z',
      author_id: 'admin-user',
    };

    let adminCallCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'client_notes') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: mockNote, error: null }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        adminCallCount++;
        // Author profile lookup after insert
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { full_name: 'Admin User' }, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createPostRequest({ clientId: 'c1', content: '  Test note  ' }) as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('note-1');
    expect(data.author_name).toBe('Admin User');
    expect(data.content).toBe('Test note');

    // Verify logActivity was called
    const { logActivity } = await import('@/lib/activity-log');
    expect(logActivity).toHaveBeenCalledWith({
      actorId: 'admin-user',
      action: 'client.note_added',
      entityType: 'profile',
      entityId: 'c1',
    });
  });

  it('returns 500 on DB insert error', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'client_notes') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Insert failed' } }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createPostRequest({ clientId: 'c1', content: 'note' }) as never);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Insert failed');
  });

  it('creates note successfully for manager on own client', async () => {
    mockServerFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'manager' }, error: null }),
        }),
      }),
    });

    const mockNote = {
      id: 'note-2',
      content: 'Manager note',
      created_at: '2026-01-02T00:00:00Z',
      author_id: 'admin-user',
    };

    let profileCallCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        profileCallCount++;
        if (profileCallCount === 1) {
          // First: manager ownership check
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { manager_id: 'admin-user' }, error: null }),
              }),
            }),
          };
        }
        // Second: author name lookup after insert
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { full_name: 'Manager Name' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'client_notes') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: mockNote, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createPostRequest({ clientId: 'c1', content: 'Manager note' }) as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe('note-2');
    expect(data.author_name).toBe('Manager Name');
  });

  it('returns author_name as fallback when profile has no full_name', async () => {
    const mockNote = {
      id: 'note-3',
      content: 'Anon note',
      created_at: '2026-01-03T00:00:00Z',
      author_id: 'admin-user',
    };

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'client_notes') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: mockNote, error: null }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { full_name: null }, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST(createPostRequest({ clientId: 'c1', content: 'Anon note' }) as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.author_name).toBe('Без имени');
  });
});
