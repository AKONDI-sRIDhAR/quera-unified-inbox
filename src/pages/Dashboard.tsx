import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { MagicBento } from "@/components/MagicBento";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { QueryInbox } from "@/components/QueryInbox";
import { QuickStats } from "@/components/QuickStats";
import { NewQueryForm } from "@/components/NewQueryForm";
import { ActiveAssignments } from "@/components/ActiveAssignments";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <MagicBento
      enableStars={true}
      starCount={12}
      enableSpotlight={true}
      spotlightRadius={300}
      enableBorderGlow={true}
      glowColor="132, 0, 255"
      enableTilt={true}
      enableMagnetism={true}
      clickEffect={true}
      textAutoHide={true}
    >
      <div className="min-h-screen bg-background p-4 pb-5">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Quera
            </h1>
            <p className="text-sm text-muted-foreground">
              Unified Query Management
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>

        <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
          {/* Top-Left: Inbox (2x1 on large screens) */}
          <div className="lg:col-span-2">
            <QueryInbox />
          </div>

          {/* Top-Right: Quick Stats (1x1) */}
          <div>
            <QuickStats />
          </div>

          {/* Middle-Left: New Query Form (1x2 on large) */}
          <div className="lg:col-span-1">
            <NewQueryForm />
          </div>

          {/* Middle-Right: Active Assignments (1x2) */}
          <div className="lg:col-span-2">
            <ActiveAssignments />
          </div>
        </div>
      </div>
    </MagicBento>
  );
};

export default Dashboard;
