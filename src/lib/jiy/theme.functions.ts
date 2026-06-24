import { createServerFn } from "@tanstack/react-start";
import { THEMES, THEME_PRIORITY, type ThemeKey } from "./themes";

export const getActiveTheme = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const flagKeys = THEME_PRIORITY.map((k) => THEMES[k].flag).filter(
      (v): v is string => Boolean(v),
    );
    if (flagKeys.length === 0) return { theme: "default" as ThemeKey };
    const { data } = await supabase
      .from("feature_flags")
      .select("key,enabled")
      .in("key", flagKeys);
    const enabled = new Set((data ?? []).filter((f) => f.enabled).map((f) => f.key));
    const active = THEME_PRIORITY.find((k) => {
      const flag = THEMES[k].flag;
      return flag !== null && enabled.has(flag);
    });
    return { theme: (active ?? "default") as ThemeKey };
  } catch {
    return { theme: "default" as ThemeKey };
  }
});
