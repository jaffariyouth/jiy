import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getFormTemplate, updateFormTemplate, type FormFieldDef } from "@/lib/jiy/form-templates.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/forms/$id")({
  component: FormEditPage,
});

function FormEditPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getFormTemplate);
  const upd = useServerFn(updateFormTemplate);
  const q = useQuery({ queryKey: ["admin", "form", id], queryFn: () => get({ data: { id } }) });

  const [fields, setFields] = useState<FormFieldDef[]>([]);
  useEffect(() => {
    if (q.data?.template) {
      const schema = q.data.template.schema as { fields?: FormFieldDef[] };
      setFields(schema.fields ?? []);
    }
  }, [q.data]);

  const save = async () => {
    try {
      await upd({ data: { id, idempotencyKey: crypto.randomUUID(), schema: { fields } } });
      toast.success("Saved");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div>
      <AdminPageHeader
        title={q.data?.template.name ?? "Form"}
        subtitle={q.data?.template.slug}
        backTo={{ to: "/admin/forms", label: "Forms" }}
        actions={<Button onClick={save}>Save</Button>}
      />
      <div className="px-6 sm:px-10 py-8">
        <FormBuilder fields={fields} onChange={setFields} />
      </div>
    </div>
  );
}
