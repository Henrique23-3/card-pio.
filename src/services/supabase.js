import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const configured = Boolean(url?.startsWith('https://') && key && !key.includes('SUBSTITUA'))
export const supabase = configured ? createClient(url, key) : null
export const BUCKET = 'dish-photos'
export const regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']
export const isAdmin = session => session?.user?.app_metadata?.role === 'admin'
export const photoUrl = path => path ? supabase?.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : ''

function check(error) { if (error) throw error }
export async function listDishes() {
  const { data, error } = await supabase.from('dishes').select('*').order('created_at')
  check(error)
  return data
}
export async function saveDish(dish, file) {
  let path = dish.photo_path || null
  let uploaded = null
  if (file) {
    const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
    if (!extensions[file.type] || file.size > 5 * 1024 * 1024) throw new Error('Use uma foto JPG, PNG ou WebP de até 5 MB.')
    uploaded = `${crypto.randomUUID()}.${extensions[file.type]}`
    const { error } = await supabase.storage.from(BUCKET).upload(uploaded, file, { contentType: file.type, upsert: false })
    check(error)
    path = uploaded
  }
  const values = { name: dish.name.trim(), description: dish.description.trim(), region: dish.region, photo_path: path, ...(dish.legacy_id ? { legacy_id: dish.legacy_id } : {}) }
  const query = dish.id ? supabase.from('dishes').update(values).eq('id', dish.id) : supabase.from('dishes').insert(values)
  const { data, error } = await query.select().single()
  if (error) {
    if (uploaded) await supabase.storage.from(BUCKET).remove([uploaded])
    throw error
  }
  // Only remove the previous object after the database successfully points to the replacement.
  if (dish.original_photo && dish.original_photo !== path) await supabase.storage.from(BUCKET).remove([dish.original_photo])
  return data
}
export async function deleteDish(dish) {
  const { error } = await supabase.from('dishes').delete().eq('id', dish.id)
  check(error)
  if (dish.photo_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([dish.photo_path])
    if (storageError) throw new Error('Prato excluído, mas a foto precisa ser removida no Storage.')
  }
}
