import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export const SolvedAssignments = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: solvedQueries, isLoading } = useQuery({
    queryKey: ["solved-queries", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("queries")
        .select("*")
        .eq("assigned_to", session.user.id)
        .in("status", ["resolved", "closed"])
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Solved Assignments</h2>
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Solved Assignments</h2>
        <Badge variant="secondary" className="ml-auto">
          {solvedQueries?.length || 0}
        </Badge>
      </div>

      <div className="space-y-3">
        {solvedQueries && solvedQueries.length > 0 ? (
          solvedQueries.map((query) => (
            <div
              key={query.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {query.channel}
                    </Badge>
                    <Badge
                      variant={query.status === "resolved" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {query.status}
                    </Badge>
                    {query.category && (
                      <Badge variant="outline" className="text-xs">
                        {query.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground mb-1 line-clamp-2">
                    {query.message}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>From: {query.sender}</span>
                    <span>•</span>
                    <span>Solved: {format(new Date(query.updated_at), "MMM d, h:mm a")}</span>
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No solved assignments yet
          </p>
        )}
      </div>
    </Card>
  );
};
