import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type AudienceValue = {
  audience_visibility: "public" | "members";
  audience_gender: "all" | "male" | "female";
  audience_min_age: number | null;
  audience_max_age: number | null;
};

export const DEFAULT_AUDIENCE: AudienceValue = {
  audience_visibility: "members",
  audience_gender: "all",
  audience_min_age: null,
  audience_max_age: null,
};

const PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: "All ages", min: null, max: null },
  { label: "Juniors 12–17", min: 12, max: 17 },
  { label: "18–24", min: 18, max: 24 },
  { label: "25+", min: 25, max: null },
];

function presetMatches(v: AudienceValue, p: (typeof PRESETS)[number]) {
  return v.audience_min_age === p.min && v.audience_max_age === p.max;
}

export function AudiencePanel({
  value,
  onChange,
}: {
  value: AudienceValue;
  onChange: (next: AudienceValue) => void;
}) {
  const customActive = !PRESETS.some((p) => presetMatches(value, p));

  return (
    <fieldset className="border border-[#e5dec9] rounded-sm p-4 space-y-4 bg-[#FAF8F5]">
      <legend className="px-2 text-xs uppercase tracking-[0.18em] text-[#6b6453]">Audience</legend>

      <div>
        <Label className="text-xs">Visibility</Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {(["public", "members"] as const).map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => onChange({ ...value, audience_visibility: v })}
              className={`px-3 py-1.5 text-sm rounded-sm border ${
                value.audience_visibility === v
                  ? "bg-[#010b21] text-white border-[#010b21]"
                  : "bg-white border-[#e5dec9] text-[#2b2a26]"
              }`}
            >
              {v === "public" ? "Public" : "Members only"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Gender</Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {(["all", "male", "female"] as const).map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => onChange({ ...value, audience_gender: g })}
              className={`px-3 py-1.5 text-sm rounded-sm border ${
                value.audience_gender === g
                  ? "bg-[#010b21] text-white border-[#010b21]"
                  : "bg-white border-[#e5dec9] text-[#2b2a26]"
              }`}
            >
              {g === "all" ? "Everyone" : g === "male" ? "Men" : "Women"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs">Age range</Label>
        <div className="flex gap-2 mt-1 flex-wrap">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.label}
              onClick={() => onChange({ ...value, audience_min_age: p.min, audience_max_age: p.max })}
              className={`px-3 py-1.5 text-sm rounded-sm border ${
                presetMatches(value, p)
                  ? "bg-[#010b21] text-white border-[#010b21]"
                  : "bg-white border-[#e5dec9] text-[#2b2a26]"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ ...value, audience_min_age: value.audience_min_age ?? 0, audience_max_age: value.audience_max_age ?? 99 })}
            className={`px-3 py-1.5 text-sm rounded-sm border ${
              customActive ? "bg-[#010b21] text-white border-[#010b21]" : "bg-white border-[#e5dec9] text-[#2b2a26]"
            }`}
          >
            Custom
          </button>
        </div>
        {customActive && (
          <div className="grid grid-cols-2 gap-3 mt-3 max-w-xs">
            <div>
              <Label className="text-xs">Min age</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={value.audience_min_age ?? ""}
                onChange={(e) =>
                  onChange({ ...value, audience_min_age: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Max age</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={value.audience_max_age ?? ""}
                onChange={(e) =>
                  onChange({ ...value, audience_max_age: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-[#6b6453]">
        Members who don't match the audience won't see this item at all. Members without a date of birth on file
        can't pass age restrictions — encourage them to complete onboarding.
      </p>
    </fieldset>
  );
}

export function pickAudience(v: AudienceValue): AudienceValue {
  return {
    audience_visibility: v.audience_visibility,
    audience_gender: v.audience_gender,
    audience_min_age: v.audience_min_age,
    audience_max_age: v.audience_max_age,
  };
}
