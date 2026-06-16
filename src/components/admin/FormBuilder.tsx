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
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormFieldDef } from "@/lib/jiy/form-templates.functions";

const TYPES: FormFieldDef["type"][] = ["text", "email", "phone", "textarea", "select", "checkbox", "number", "date"];

function newField(): FormFieldDef {
  return { id: crypto.randomUUID(), type: "text", label: "Untitled field", required: false };
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
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-[#010b21]">Fields</h3>
          <Button size="sm" onClick={() => onChange([...fields, newField()])}>
            <Plus className="h-4 w-4 mr-1" /> Add field
          </Button>
        </div>
        {fields.length === 0 && (
          <p className="text-sm text-[#6b6453] italic">No fields yet. Click "Add field" to start.</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((f) => (
              <FieldEditor key={f.id} field={f} onChange={(p) => update(f.id, p)} onRemove={() => remove(f.id)} />
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
  onChange,
  onRemove,
}: {
  field: FormFieldDef;
  onChange: (patch: Partial<FormFieldDef>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [optionsText, setOptionsText] = useState((field.options ?? []).join("\n"));

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-[#e5dec9] rounded-sm p-3">
      <div className="flex items-center gap-2 mb-3">
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
        <label className="text-xs flex items-center gap-1 text-[#6b6453]">
          <input type="checkbox" checked={field.required} onChange={(e) => onChange({ required: e.target.checked })} />
          Required
        </label>
        <button type="button" onClick={onRemove} className="text-[#9b2c2c] hover:text-[#6e1f1f]">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        <Input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Field label"
        />
        <Input
          value={field.helpText ?? ""}
          onChange={(e) => onChange({ helpText: e.target.value || undefined })}
          placeholder="Help text (optional)"
        />
        {field.type === "select" && (
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
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FormFieldDef }) {
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
      ) : field.type === "checkbox" ? (
        <input type="checkbox" disabled />
      ) : (
        <Input type={field.type === "phone" ? "tel" : field.type} disabled />
      )}
      {field.helpText && <p className="text-xs text-[#6b6453]">{field.helpText}</p>}
    </div>
  );
}
