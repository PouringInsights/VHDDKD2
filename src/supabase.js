import { createClient } from '@supabase/supabase-js'

// Điền vào .env.local sau khi tạo project Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// Lấy top 20 điểm cao nhất
export async function fetchLeaderboard() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(20)
  if (error) { console.error(error); return [] }
  return data || []
}

// Lưu điểm mới
export async function saveScore({ name, avatar, score, mode }) {
  if (!supabase) return
  await supabase.from('leaderboard').insert([{ name, avatar, score, mode }])
}
