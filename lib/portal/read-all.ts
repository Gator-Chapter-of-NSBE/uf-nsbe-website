import 'server-only'

// PostgREST caps responses. Read in batches so historical totals stay complete.
export async function readAll<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: unknown[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = []
  const batchSize = 500
  for (let from = 0; ; from += batchSize) {
    const { data, error } = await fetchPage(from, from + batchSize - 1)
    if (error || !data) throw new Error('Member records could not be loaded.')
    rows.push(...(data as T[]))
    if (data.length < batchSize) return rows
  }
}
