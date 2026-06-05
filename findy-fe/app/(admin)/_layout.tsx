import { AdminShell } from "@/components/admin/AdminShell";
import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <AdminShell>
      <Stack screenOptions={{ headerShown: false }} />
    </AdminShell>
  );
}
