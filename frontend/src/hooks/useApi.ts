import { useCallback, useEffect, useMemo, useState } from 'react'

export function useApi<T>(fn: () => Promise<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn()
      setData(res)
      return res
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Error')
      throw e
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { loading, error, data, run, setData }
}

const queryCache = new Map<string, unknown>()

export function useApiQuery<T>(key: string, fn: () => Promise<T>, enabled = true) {
  const [loading, setLoading] = useState(enabled && !queryCache.has(key))
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(() => (queryCache.get(key) as T | undefined) || null)

  const load = useCallback(async (force = false) => {
    if (!enabled) return null
    if (!force && queryCache.has(key)) {
      const cached = queryCache.get(key) as T
      setData(cached)
      return cached
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fn()
      queryCache.set(key, res)
      setData(res)
      return res
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.error || e.message || 'Error')
      throw e
    } finally {
      setLoading(false)
    }
  }, [enabled, fn, key])

  useEffect(() => {
    load()
  }, [load])

  return useMemo(() => ({
    loading,
    error,
    data,
    refetch: () => load(true),
    setData
  }), [data, error, load, loading])
}

export function invalidateApiQuery(prefix: string) {
  Array.from(queryCache.keys()).forEach((key) => {
    if (key.startsWith(prefix)) queryCache.delete(key)
  })
}
