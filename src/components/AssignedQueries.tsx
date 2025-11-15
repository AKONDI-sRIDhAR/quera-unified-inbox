import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Query {
  id: string;
  sender: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
}

export const AssignedQueries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyQueries();

    const channel = supabase
      .channel("my-queries-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queries",
        },
        () => {
          fetchMyQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMyQueries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("queries")
      .select("*")
      .eq("assigned_to", user.id)
      .in("status", ["assigned", "in_progress"])
      .order("priority", { ascending: false })
      .limit(10);

    if (!error && data) {
      setQueries(data);
    }
    setLoading(false);
  };

  const handleSolve = async (queryId: string) => {
    const { error } = await supabase
      .from("queries")
      .update({ status: "resolved" })
      .eq("id", queryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark query as resolved",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Query resolved",
        description: "The query has been marked as resolved",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      "5": "bg-priority-5",
      "4": "bg-priority-4",
      "3": "bg-priority-3",
      "2": "bg-priority-2",
      "1": "bg-priority-1",
    };
    return colors[priority] || "bg-priority-3";
  };

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          My Assigned Queries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : queries.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No assigned queries
            </div>
          ) : (
            <div className="space-y-3">
              {queries.map((query) => (
                <div
                  key={query.id}
                  className="flex items-start justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getPriorityColor(query.priority)}`}
                      />
                      <span className="text-sm font-medium">
                        {query.sender}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {query.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {query.message}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSolve(query.id)}
                    className="ml-2 shrink-0"
                  >
                    <CheckCircle className="h-4 w-4" />
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
