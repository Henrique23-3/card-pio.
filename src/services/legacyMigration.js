import { listDishes, regions, saveDish } from './supabase'

export function legacyDishes() {
  try { const data = JSON.parse(localStorage.getItem('brasil-sabores-dishes')); return Array.isArray(data) ? data.filter(d => d?.id && typeof d.name === 'string' && typeof d.description === 'string' && regions.includes(d.region)) : [] }
  catch { return [] }
}
export async function migrateLegacy() {
  const existing = await listDishes()
  const ids = new Set(existing.map(d => d.legacy_id))
  let count = 0
  for (const dish of legacyDishes()) {
    if (ids.has(dish.id)) continue
    let file
    if (/^data:image\/(jpeg|png|webp);base64,/.test(dish.image || '')) {
      const blob = await (await fetch(dish.image)).blob()
      file = new File([blob], 'foto', { type: blob.type })
    }
    await saveDish({ name: dish.name, description: dish.description, region: dish.region, legacy_id: dish.id }, file)
    count++
  }
  return count
}
