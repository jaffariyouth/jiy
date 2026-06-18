import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormFieldDef } from "@/lib/jiy/form-templates.functions";

const TYPES: FormFieldDef["type"][] = [
  "text", "email", "phone", "number", "date",
  "textarea", "select", "radio", "checkbox", "file",
  "section", "paragraph",
];

const TYPES_WITH_OPTIONS: FormFieldDef["type"][] = ["select", "radio"];
const NON_INPUT_TYPES: FormFieldDef["type"][] = ["section", "paragraph"];

function newField(type: FormFieldDef["type"] = "text"): FormFieldDef {
  return { id: crypto.randomUUID(), type, label: "Untitled field", required: false };
}

export function evalVisibility(field: FormFieldDef, values: Record<string, unknown>): boolean {
  if (!field.visibility) return true;
  const v = values[field.visibility.fieldId];
  const str = v == null ? "" : String(v);
  switch (field.visibility.operator) {
    case "equals": return str === (field.visibility.value ?? "");
    case "not_equals": return str !== (field.visibility.value ?? "");
    case "is_empty": return str.trim() === "";
    case "is_not_empty": return str.trim() !== "";
  }
}

export function FormBuilder({
  fields,
  onChange,
}: {
  fields: FormFieldDef[];
  onChange: (fields: FormFieldDef[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === e.active.id);
    const newIndex = fields.findIndex((f) => f.id === e.over!.id);
    onChange(arrayMove(fields, oldIndex, newIndex));
  };

  const update = (id: string, patch: Partial<FormFieldDef>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif text-lg text-[#010b21]">Fields</h3>
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" onClick={() => onChange([...fields, newField("text")])}>
              <Plus className="h-4 w-4 mr-1" /> Field
            </Button>
            <Button size="sm" variant="outline" onClick={() => onChange([...fields, newField("section")])}>
              + Section
            </Button>
            <Button size="sm" variant="outline" onClick={() => onChange([...fields, newField("paragraph")])}>
              + Paragraph
            </Button>
          </div>
        </div>
        {fields.length === 0 && (
          <p className="text-sm text-[#6b6453] italic">No fields yet. Add a field, section, or paragraph.</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((f) => (
              <FieldEditor
                key={f.id}
                field={f}
                priorFields={fields.slice(0, fields.indexOf(f)).filter((p) => !NON_INPUT_TYPES.includes(p.type))}
                onChange={(p) => update(f.id, p)}
                onRemove={() => remove(f.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </section>

      <section>
        <h3 className="font-serif text-lg text-[#010b21] mb-3">Live preview</h3>
        <div className="bg-white border border-[#e5dec9] rounded-sm p-5 space-y-4">
          {fields.length === 0 && <p className="text-sm text-[#6b6453] italic">Form preview appears here.</p>}
          {fields.map((f) => (
            <FieldPreview key={f.id} field={f} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FieldEditor({
  field,
  priorFields,
  onChange,
  onRemove,
}: {
  field: FormFieldDef;
  priorFields: FormFieldDef[];
  onChange: (patch: Partial<FormFieldDef>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [optionsText, setOptionsText] = useState((field.options ?? []).join("\n"));
  const [showVisibility, setShowVisibility] = useState(!!field.visibility);

  const isNonInput = NON_INPUT_TYPES.includes(field.type);
  const hasOptions = TYPES_WITH_OPTIONS.includes(field.type);

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-[#e5dec9] rounded-sm p-3">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button type="button" {...attributes} {...listeners} className="cursor-grab text-[#6b6453]">
          <GripVertical className="h-4 w-4" />
        </button>
        <select
          value={field.type}
          onChange={(e) => onChange({ type: e.target.value as FormFieldDef["type"] })}
          className="text-sm border border-[#e5dec9] rounded-sm px-2 py-1 bg-white"
        >
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex-1" />
        {!isNonInput && (
          <label className="text-xs flex items-center gap-1 text-[#6b6453]">
            <input type="checkbox" checked={field.required} onChange={(e) => onChange({ required: e.target.checked })} />
            Required
          </label>
        )}
        {!isNonInput && priorFields.length > 0 && (
          <button
            type="button"
            onClick={() => setShowVisibility((s) => !s)}
            title="Conditional visibility"
            className="text-[#6b6453] hover:text-[#010b21]"
          >
            {field.visibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
        <button type="button" onClick={onRemove} className="text-[#9b2c2c] hover:text-[#6e1f1f]">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        <Input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder={field.type === "section" ? "Section heading" : field.type === "paragraph" ? "Block title (hidden)" : "Field label"}
        />
        {field.type === "paragraph" ? (
          <textarea
            value={field.helpText ?? ""}
            onChange={(e) => onChange({ helpText: e.target.value || undefined })}
            placeholder="Markdown body shown on the form"
            rows={3}
            className="w-full border border-[#e5dec9] rounded-sm px-2 py-1 text-sm font-mono"
          />
        ) : (
          <Input
            value={field.helpText ?? ""}
            onChange={(e) => onChange({ helpText: e.target.value || undefined })}
            placeholder={field.type === "section" ? "Subhead (optional)" : "Help text (optional)"}
          />
        )}
        {hasOptions && (
          <div>
            <Label className="text-xs text-[#6b6453]">Options (one per line)</Label>
            <textarea
              value={optionsText}
              onChange={(e) => {
                setOptionsText(e.target.value);
                onChange({ options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) });
              }}
              rows={3}
              className="w-full border border-[#e5dec9] rounded-sm px-2 py-1 text-sm"
            />
          </div>
        )}

        {showVisibility && !isNonInput && priorFields.length > 0 && (
          <div className="border-t border-[#f0ead7] pt-2 mt-2 space-y-2">
            <Label className="text-xs text-[#6b6453]">Show this field when…</Label>
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <select
                value={field.visibility?.fieldId ?? priorFields[0].id}
                onChange={(e) => onChange({
                  visibility: {
                    fieldId: e.target.value,
                    operator: field.visibility?.operator ?? "equals",
                    value: field.visibility?.value,
                  },
                })}
                className="border border-[#e5dec9] rounded-sm px-2 py-1 bg-white"
              >
                {priorFields.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <select
                value={field.visibility?.operator ?? "equals"}
                onChange={(e) => onChange({
                  visibility: {
                    fieldId: field.visibility?.fieldId ?? priorFields[0].id,
                    operator: e.target.value as NonNullable<FormFieldDef["visibility"]>["operator"],
                    value: field.visibility?.value,
                  },
                })}
                className="border border-[#e5dec9] rounded-sm px-2 py-1 bg-white"
              >
                <option value="equals">equals</option>
                <option value="not_equals">does not equal</option>
                <option value="is_empty">is empty</option>
                <option value="is_not_empty">is not empty</option>
              </select>
              {(field.visibility?.operator === "equals" || field.visibility?.operator === "not_equals" || !field.visibility) && (
                <Input
                  value={field.visibility?.value ?? ""}
                  onChange={(e) => onChange({
                    visibility: {
                      fieldId: field.visibility?.fieldId ?? priorFields[0].id,
                      operator: field.visibility?.operator ?? "equals",
                      value: e.target.value,
                    },
                  })}
                  placeholder="value"
                  className="h-7 text-xs w-32"
                />
              )}
              {field.visibility && (
                <button type="button" className="text-[#9b2c2c]" onClick={() => onChange({ visibility: undefined })}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FormFieldDef }) {
  if (field.type === "section") {
    return (
      <div className="border-b border-[#e5dec9] pb-1">
        <h4 className="font-serif text-lg text-[#010b21]">{field.label}</h4>
        {field.helpText && <p className="text-xs text-[#6b6453]">{field.helpText}</p>}
      </div>
    );
  }
  if (field.type === "paragraph") {
    return (
      <div className="prose prose-sm max-w-none text-[#2b2a26]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{field.helpText ?? ""}</ReactMarkdown>
      </div>
    );
  }
  const label = (
    <Label className="text-sm font-medium text-[#010b21]">
      {field.label}
      {field.required && <span className="text-[#9b2c2c] ml-1">*</span>}
    </Label>
  );
  return (
    <div className="space-y-1">
      {label}
      {field.type === "textarea" ? (
        <textarea className="w-full border border-[#e5dec9] rounded-sm px-2 py-1 text-sm" rows={3} disabled />
      ) : field.type === "select" ? (
        <select className="w-full border border-[#e5dec9] rounded-sm px-2 py-1 text-sm bg-white" disabled>
          <option>—</option>
          {(field.options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : field.type === "radio" ? (
        <div className="space-y-1">
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm">
              <input type="radio" disabled /> {o}
            </label>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <input type="checkbox" disabled />
      ) : field.type === "file" ? (
        <input type="file" disabled className="text-sm" />
      ) : (
        <Input type={field.type === "phone" ? "tel" : field.type} disabled />
      )}
      {field.helpText && <p className="text-xs text-[#6b6453]">{field.helpText}</p>}
    </div>
  );
}
