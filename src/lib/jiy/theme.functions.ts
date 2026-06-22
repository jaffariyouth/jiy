import { createServerFn } from "@tanstack/react-start";

export const getActiveTheme = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", "theme_muharram")
      .maybeSingle();
    return { muharram: Boolean(data?.enabled) };
  } catch {
    return { muharram: false };
  }
});
