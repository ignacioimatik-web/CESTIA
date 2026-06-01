'use client'

import { createClient } from '@/lib/supabase/client'
import type { Household, HouseholdMember } from '@/types/database'
import { useCallback, useEffect, useState } from 'react'

export function useHousehold() {
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchHousehold = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: member } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      setLoading(false)
      return
    }

    const [{ data: householdData }, { data: membersData }] = await Promise.all([
      supabase.from('households').select('*').eq('id', member.household_id).single(),
      supabase.from('household_members').select('*').eq('household_id', member.household_id),
    ])

    if (householdData) setHousehold(householdData)
    if (membersData) setMembers(membersData)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchHousehold()
  }, [fetchHousehold])

  const updateHousehold = async (updates: Partial<Household>) => {
    if (!household) return

    const { data, error } = await supabase
      .from('households')
      .update(updates)
      .eq('id', household.id)
      .select()
      .single()

    if (!error && data) {
      setHousehold(data)
    }

    return { data, error }
  }

  return { household, members, loading, refetch: fetchHousehold, updateHousehold }
}
