interface ApiMeta {
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  meta: ApiMeta;
}

export function parseCollectionResponse<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (!raw || typeof raw !== "object") return [];

  const envelope = raw as {
    data?: unknown;
    tasks?: unknown;
    users?: unknown;
  };

  if (Array.isArray(envelope.data)) return envelope.data as T[];
  if (Array.isArray(envelope.tasks)) return envelope.tasks as T[];
  if (Array.isArray(envelope.users)) return envelope.users as T[];

  return [];
}

export function parsePaginatedResponse<T>(
  raw: unknown,
  fallbackLimit: number,
  fallbackOffset: number,
): PaginatedResult<T> {
  const rows = parseCollectionResponse<T>(raw);

  if (raw && typeof raw === "object") {
    const envelope = raw as { meta?: Partial<ApiMeta> };
    if (envelope.meta) {
      return {
        data: rows,
        meta: {
          total: envelope.meta.total ?? rows.length,
          limit: envelope.meta.limit ?? fallbackLimit,
          offset: envelope.meta.offset ?? fallbackOffset,
          has_next: Boolean(envelope.meta.has_next),
        },
      };
    }
  }

  return {
    data: rows,
    meta: {
      total: rows.length,
      limit: fallbackLimit,
      offset: fallbackOffset,
      has_next: false,
    },
  };
}
