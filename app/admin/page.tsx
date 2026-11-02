"use client";

import { AdminConsole } from "@/components/admin/AdminConsole";
import { RequireAuth } from "@/components/RequireAuth";

export default function AdminPage() {
  return <RequireAuth admin>{() => <AdminConsole />}</RequireAuth>;
}
