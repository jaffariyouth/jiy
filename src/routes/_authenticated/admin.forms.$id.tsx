import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getFormTemplate,
  updateFormTemplate,
  type FormFieldDef,
  type FormSettings,
} from "@/lib/jiy/form-templates.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { FormSettingsPanel } from "@/components/admin/FormSettingsPanel";
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
  const [settings, setSettings] = useState<FormSettings>({});

  useEffect(() => {
    if (q.data?.template) {
      const schema = q.data.template.schema as { fields?: FormFieldDef[]; settings?: FormSettings };
      setFields(schema.fields ?? []);
      setSettings(schema.settings ?? {});
    }
  }, [q.data]);

  const save = async () => {
    try {
      await upd({
        data: {
          id,
          idempotencyKey: crypto.randomUUID(),
          schema: { fields, settings },
        },
      });
      toast.success("Saved");
    } catch (e) { toast.error((e as Error).message); }
  };

  const publicLink = `/forms/${id}`;

  return (
    <div>
      <AdminPageHeader
        title={q.data?.template.name ?? "Form"}
        subtitle={q.data?.template.slug}
        backTo={{ to: "/admin/forms", label: "Forms" }}
        actions={<Button onClick={save}>Save</Button>}
      />
      <div className="px-6 sm:px-10 py-8">
        <p className="text-xs text-[#6b6453] mb-4">
          Public link: <a href={publicLink} className="font-mono underline" target="_blank" rel="noreferrer">{publicLink}</a>
          {" · "}
          Attach to an event with <code className="font-mono">?event=&lt;eventId&gt;</code>
        </p>
        <Tabs defaultValue="fields">
          <TabsList>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="fields" className="mt-6">
            <FormBuilder fields={fields} onChange={setFields} />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <FormSettingsPanel settings={settings} onChange={setSettings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
