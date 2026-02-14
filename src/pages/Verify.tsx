import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, GraduationCap, Loader2 } from "lucide-react";

export default function Verify() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const { data: app } = await supabase
        .from("id_applications")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (app) {
        setData(app);
        setValid(["approved", "printed", "ready", "collected"].includes(app.status));
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, reg_number, faculty, course, campus, photo_url")
          .eq("user_id", app.user_id)
          .single();
        setProfile(prof);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Egerton University</span>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            {!data ? (
              <>
                <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">Invalid ID</h2>
                <p className="text-muted-foreground">This student ID could not be found.</p>
              </>
            ) : valid ? (
              <>
                <CheckCircle2 className="h-16 w-16 mx-auto text-primary mb-4" />
                <h2 className="text-xl font-bold mb-4">Verified Student</h2>
                {profile?.photo_url && (
                  <div className="h-24 w-20 mx-auto rounded-lg overflow-hidden mb-4">
                    <img src={profile.photo_url} alt="Student" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{profile?.full_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reg No.</span><span className="font-medium">{profile?.reg_number}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Course</span><span className="font-medium">{profile?.course}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Faculty</span><span className="font-medium">{profile?.faculty}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-primary">Active</span></div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">ID Not Valid</h2>
                <p className="text-muted-foreground">This student ID is not currently active. Status: {data.status}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
