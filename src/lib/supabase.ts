import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Handle missing env vars gracefully
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(url, key);

export async function saveMenu(menu: object): Promise<{ error: string | null }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase not configured, skipping save");
    return { error: null };
  }

  try {
    const { error } = await supabase.from("menus").insert([menu]);
    return { error: error ? error.message : null };
  } catch (err) {
    console.error("Supabase save error:", err);
    return { error: "Failed to save menu" };
  }
}
