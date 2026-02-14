import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckSquare, AlertTriangle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, lost: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [totalRes, pendingRes, approvedRes, lostRes] = await Promise.all([
        supabase.from("id_applications").select("id", { count: "exact", head: true }),
        supabase.from("id_applications").select("id", { count: "exact", head: true }).in("status", ["submitted", "verified"]),
        supabase.from("id_applications").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("lost_reports").select("id", { count: "exact", head: true }).eq("status", "reported"),
      ]);
      setStats({
        total: totalRes.count || 0,
        pending: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        lost: lostRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Applications", value: stats.total, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "bg-amber-100 text-amber-700" },
    { label: "Approved IDs", value: stats.approved, icon: CheckSquare, color: "bg-emerald-100 text-emerald-700" },
    { label: "Lost Reports", value: stats.lost, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl p-3 ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-bold">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
