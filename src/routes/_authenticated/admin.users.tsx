import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getMyRoles, listUsers, grantRole, revokeRole, markUserAsISIJMember,
  type AdminUserDTO,
} from "@/lib/jiy/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin · Users — JIY" }] }),
  beforeLoad: async () => {
    const roles = await getMyRoles();
    if (!roles.includes("admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const usersQ = useQuery({
    queryKey: ["admin", "users", q],
    queryFn: () => fetchUsers({ data: { search: q, limit: 100, offset: 0 } }),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Grant or revoke roles, and mark verified ISIJ members.
          </p>
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQ(search.trim());
          }}
        >
          <Input
            placeholder="Search display name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </header>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQ.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {usersQ.data?.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                onChange={() => qc.invalidateQueries({ queryKey: ["admin", "users"] })}
              />
            ))}
            {usersQ.data && usersQ.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  scholar: "Scholar",
  member_isij: "ISIJ Member",
  member_standalone: "Standalone",
};

const GRANTABLE: { role: "admin" | "scholar" | "member_standalone"; label: string }[] = [
  { role: "admin", label: "Grant admin" },
  { role: "scholar", label: "Grant scholar" },
  { role: "member_standalone", label: "Grant standalone" },
];

function UserRow({ user, onChange }: { user: AdminUserDTO; onChange: () => void }) {
  const grant = useServerFn(grantRole);
  const revoke = useServerFn(revokeRole);

  const grantMut = useMutation({
    mutationFn: (role: "admin" | "scholar" | "member_standalone") =>
      grant({ data: { idempotencyKey: crypto.randomUUID(), userId: user.id, role } }),
    onSuccess: () => { toast.success("Role granted"); onChange(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const revokeMut = useMutation({
    mutationFn: (role: AdminUserDTO["roles"][number]) =>
      revoke({ data: { idempotencyKey: crypto.randomUUID(), userId: user.id, role } }),
    onSuccess: () => { toast.success("Role revoked"); onChange(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{user.displayName ?? <span className="text-muted-foreground">(no name)</span>}</div>
        <div className="text-xs text-muted-foreground">{user.id}</div>
      </TableCell>
      <TableCell className="text-sm">{user.country ?? "—"}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {user.roles.length === 0 && <span className="text-xs text-muted-foreground">none</span>}
          {user.roles.map((r) => (
            <button
              key={r}
              type="button"
              title="Click to revoke"
              onClick={() => {
                if (confirm(`Revoke "${ROLE_LABELS[r] ?? r}" from this user?`)) {
                  revokeMut.mutate(r);
                }
              }}
              className="inline-flex"
            >
              <Badge variant="secondary">{ROLE_LABELS[r] ?? r}</Badge>
            </button>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex flex-wrap gap-2">
          {GRANTABLE.filter((g) => !user.roles.includes(g.role)).map((g) => (
            <Button
              key={g.role}
              size="sm"
              variant="outline"
              disabled={grantMut.isPending}
              onClick={() => grantMut.mutate(g.role)}
            >
              {g.label}
            </Button>
          ))}
          <MarkISIJDialog user={user} onDone={onChange} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function MarkISIJDialog({ user, onDone }: { user: AdminUserDTO; onDone: () => void }) {
  const mark = useServerFn(markUserAsISIJMember);
  const [open, setOpen] = useState(false);
  const [isijId, setIsijId] = useState("");
  const mut = useMutation({
    mutationFn: () =>
      mark({
        data: {
          idempotencyKey: crypto.randomUUID(),
          userId: user.id,
          isijId: isijId.trim(),
        },
      }),
    onSuccess: () => {
      toast.success("Marked as ISIJ member");
      setOpen(false);
      setIsijId("");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (user.roles.includes("member_isij")) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Mark as ISIJ</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as ISIJ member</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="isij-id">ISIJ membership number</Label>
          <Input
            id="isij-id"
            value={isijId}
            onChange={(e) => setIsijId(e.target.value)}
            placeholder="e.g. ISIJ-2026-0123"
          />
          <p className="text-xs text-muted-foreground">
            Manual verification stub. External registry sync lands in a later phase.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => mut.mutate()}
            disabled={!isijId.trim() || mut.isPending}
          >
            {mut.isPending ? "Saving…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}