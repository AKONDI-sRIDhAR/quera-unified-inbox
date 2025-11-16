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
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          My Assigned Queries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : queries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No assigned queries
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="hidden grid-cols-12 items-center gap-4 p-2 font-semibold text-muted-foreground md:grid">
              <div className="col-span-2">Sender</div>
              <div className="col-span-4">Query</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Remarks</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            {/* Rows */}
            <div className="space-y-3">
              {queries.map((query) => (
                <div
                  key={query.id}
                  className="grid grid-cols-1 items-start gap-4 rounded-lg border p-3 md:grid-cols-12"
                >
                  <div className="col-span-2 flex items-center gap-2 font-medium">
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${getPriorityColor(
                        query.priority
                      )}`}
                    />
                    {query.sender}
                  </div>
                  <div className="col-span-4 text-sm text-muted-foreground">
                    {query.message}
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary" className="capitalize">
                      {query.status}
                    </Badge>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground italic">
                    No remarks yet.
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSolve(query.id)}
                      className="shrink-0"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Solve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
