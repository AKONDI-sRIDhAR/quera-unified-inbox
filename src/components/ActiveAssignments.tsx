import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Query {
  id: string;
  sender: string;
  message: string;
  status: string;
  priority: string;
  category: string;
}

export const ActiveAssignments = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQueries();

    const channel = supabase
      .channel("assignments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queries",
        },
        () => {
          fetchQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueries = async () => {
    const { data, error } = await supabase
      .from("queries")
      .select("*")
      .neq("status", "closed")
      .order("priority", { ascending: false })
      .limit(10);

    if (!error && data) {
      setQueries(data);
    }
    setLoading(false);
  };

  const handleAssign = async (queryId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("queries")
      .update({ assigned_to: user.id, status: "assigned" })
      .eq("id", queryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign query",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Query assigned",
        description: "You've been assigned to this query",
      });
    }
  };

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Active Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : queries.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No active queries
            </div>
          ) : (
            <div className="space-y-3">
              {queries.map((query) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {query.sender}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {query.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {query.message}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAssign(query.id)}
                    disabled={query.status !== "open"}
                    className="ml-2"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
