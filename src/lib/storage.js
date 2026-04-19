import { supabase } from './supabase';

export function getPortfolioPublicUrl(storagePath) {
  if (!storagePath) return null;
  const { data } = supabase.storage.from('portfolio').getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}
