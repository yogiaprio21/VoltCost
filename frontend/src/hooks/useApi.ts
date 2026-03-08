import { useCallback, useState } from 'react'

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
