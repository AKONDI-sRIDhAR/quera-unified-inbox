import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagicBento } from "@/components/MagicBento";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { QueryInbox } from "@/components/QueryInbox";
import { QuickStats } from "@/components/QuickStats";
import { NewQueryForm } from "@/components/NewQueryForm";
import { ActiveAssignments } from "@/components/ActiveAssignments";
import { AssignedQueries } from "@/components/AssignedQueries";
import { SolvedAssignments } from "@/components/SolvedAssignments";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import Shuffle from "@/components/Shuffle";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loggedIn = localStorage.getItem("quera_logged_in");
    if (loggedIn !== "true") {
      navigate("/auth");
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("quera_logged_in");
    localStorage.removeItem("quera_username");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/auth");
  };

  if (!isLoggedIn) return null;

  return (
    <MagicBento
      enableStars={true}
      starCount={12}
      enableSpotlight={true}
      spotlightRadius={300}
      enableBorderGlow={true}
      glowColor="132, 0, 255"
      enableMagnetism={false}
      clickEffect={true}
      textAutoHide={true}
    >
      <div className="bg-background p-4 pb-5">
        <header className="mb-3 flex flex-col items-center">
          <div className="text-center">
            <Shuffle
              text="Quera"
              className="text-5xl font-bold tracking-tight text-foreground font-pixelify"
              shuffleDirection="right"
              duration={0.35}
              animationMode="evenodd"
              shuffleTimes={1}
              ease="power3.out"
              stagger={0.03}
              threshold={0.1}
              triggerOnce={true}
              triggerOnHover={true}
              respectReducedMotion={true}
              onShuffleComplete={undefined}
              colorFrom={undefined}
              colorTo={undefined}
            />
            <p className="text-sm text-muted-foreground">
              Unified Query Management
            </p>
          </div>
        </header>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Row 1: Inbox and Quick Stats */}
          <div className="lg:col-span-2">
            <QueryInbox />
          </div>
          <div className="lg:col-span-1">
            <QuickStats />
          </div>

          {/* Row 2: Assigned Queries */}
          <div className="lg:col-span-3">
            <AssignedQueries />
          </div>

          {/* Row 3: New Query Form and Active Assignments */}
          <div className="lg:col-span-1">
            <NewQueryForm />
          </div>
          <div className="lg:col-span-2">
            <ActiveAssignments />
          </div>

          {/* Row 4: Solved Assignments */}
          <div className="lg:col-span-3">
            <SolvedAssignments />
          </div>
        </div>
      </div>
    </MagicBento>
  );
};

export default Dashboard;
