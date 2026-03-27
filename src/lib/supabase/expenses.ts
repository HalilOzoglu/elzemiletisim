import { createClient } from './server'
import type { Expense } from '@/types'

type ExpenseRow = {
  id: string
  device_id: string
  amount: number
  description: string
  created_at: string | null
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    deviceId: row.device_id,
    amount: row.amount,
    description: row.description,
    createdAt: row.created_at ?? undefined,
  }
}

export async function createExpense(data: {
  deviceId: string
  amount: number
  description: string
}): Promise<Expense> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('expenses')
    .insert({
      device_id: data.deviceId,
      amount: data.amount,
      description: data.description,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToExpense(row as ExpenseRow)
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getExpensesByDevice(deviceId: string): Promise<Expense[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as ExpenseRow[]).map(rowToExpense)
}
