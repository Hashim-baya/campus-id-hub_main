import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

export default function Management() {
  const [applications, setApplications] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("id_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((a) => a.user_id))];
        const { data: profs } = await supabase.from("profiles").select("*").in("user_id", userIds);
        const map: Record<string, any> = {};
        profs?.forEach((p) => (map[p.user_id] = p));
        setProfiles(map);
      }
      setApplications(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = applications.filter((app) => {
    const prof = profiles[app.user_id];
    const q = search.toLowerCase();
    return (
      !search ||
      prof?.full_name?.toLowerCase().includes(q) ||
      prof?.reg_number?.toLowerCase().includes(q) ||
      app.status.includes(q)
    );
  });

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    submitted: "bg-blue-100 text-blue-800",
    verified: "bg-cyan-100 text-cyan-800",
    approved: "bg-primary/10 text-primary",
    printed: "bg-amber-100 text-amber-800",
    ready: "bg-emerald-100 text-emerald-800",
    collected: "bg-primary/20 text-primary",
    rejected: "bg-destructive/10 text-destructive",
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">ID Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all student IDs</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, reg number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Reg Number</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => {
                const prof = profiles[app.user_id];
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{prof?.full_name || "—"}</TableCell>
                    <TableCell>{prof?.reg_number || "—"}</TableCell>
                    <TableCell className="text-sm">{prof?.faculty || "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[app.status] || ""}>{app.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
