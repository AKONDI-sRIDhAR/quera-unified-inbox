import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Query {
  id: string;
  sender: string;
  channel: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

export const QueryInbox = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueries();

    const channel = supabase
      .channel("queries-changes")
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
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setQueries(data);
    }
    setLoading(false);
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
        <CardTitle className="text-lg font-semibold">Inbox</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : queries.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No queries yet
            </div>
          ) : (
            <div className="space-y-3">
              {queries.map((query, index) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md"
                  style={{ borderRadius: index % 2 === 0 ? "6px" : "4px" }}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getPriorityColor(
                          query.priority
                        )}`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {query.sender}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {query.channel}
                    </Badge>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                    {query.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize">
                      {query.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(query.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
