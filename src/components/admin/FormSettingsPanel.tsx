import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormSettings } from "@/lib/jiy/form-templates.functions";

export function FormSettingsPanel({
  settings,
  onChange,
}: {
  settings: FormSettings;
  onChange: (s: FormSettings) => void;
}) {
  const set = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Label>Confirmation message (markdown)</Label>
        <textarea
          value={settings.confirmationMessage ?? ""}
          onChange={(e) => set("confirmationMessage", e.target.value || undefined)}
          rows={4}
          placeholder="Thank you. Your response has been received."
          className="w-full border border-[#e5dec9] rounded-sm px-2 py-1 text-sm font-mono"
        />
        <p className="text-xs text-[#6b6453] mt-1">Shown after submit when no redirect URL is set.</p>
      </div>

      <div>
        <Label>Redirect URL (optional)</Label>
        <Input
          value={settings.redirectUrl ?? ""}
          onChange={(e) => set("redirectUrl", e.target.value || undefined)}
          placeholder="/dashboard or https://…"
        />
        <p className="text-xs text-[#6b6453] mt-1">Takes precedence over the confirmation message.</p>
      </div>

      <div>
        <Label>Notification email (optional)</Label>
        <Input
          type="email"
          value={settings.notificationEmail ?? ""}
          onChange={(e) => set("notificationEmail", e.target.value || undefined)}
          placeholder="admin@example.org"
        />
        <p className="text-xs text-[#9b2c2c] mt-1">
          Stored, but email delivery is not yet wired. Activates when Resend is configured.
        </p>
      </div>
    </div>
  );
}
