"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { useUser } from "@/hooks/use-user"
import { addToMyList, removeFromMyList, getMyList } from "@/lib/actions/my-list"

export function useMyList() {
  const { isAuthenticated } = useUser()
  const [list, setList] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!isAuthenticated) {
      setList([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    getMyList().then((ids) => {
      if (!cancelled) {
        setList(ids)
        setIsLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [isAuthenticated])

  const isInList = useCallback(
    (tmdbId: number) => list.includes(tmdbId),
    [list]
  )

  const toggle = useCallback(
    (tmdbId: number) => {
      if (!isAuthenticated) return

      const wasInList = list.includes(tmdbId)

      setList((prev) =>
        wasInList
          ? prev.filter((id) => id !== tmdbId)
          : [tmdbId, ...prev]
      )

      startTransition(async () => {
        const result = wasInList
          ? await removeFromMyList(tmdbId)
          : await addToMyList(tmdbId)

        if ("error" in result) {
          setList((prev) =>
            wasInList
              ? [tmdbId, ...prev]
              : prev.filter((id) => id !== tmdbId)
          )
        }
      })
    },
    [isAuthenticated, list]
  )

  return { list, isInList, toggle, isLoading, isPending }
}
