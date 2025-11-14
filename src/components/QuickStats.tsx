import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Stats {
  total: number;
  open: number;
  avgResponse: string;
  topCategory: string;
}

export const QuickStats = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    avgResponse: "N/A",
    topCategory: "N/A",
  });

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel("stats-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queries",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    const { data: queries } = await supabase.from("queries").select("*");

    if (queries) {
      const total = queries.length;
      const open = queries.filter((q) => q.status === "open").length;

      // Calculate most common category
      const categoryCount: Record<string, number> = {};
      queries.forEach((q) => {
        categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
      });
      const topCategory =
        Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "N/A";

      setStats({
        total,
        open,
        avgResponse: "2.5h",
        topCategory: topCategory.charAt(0).toUpperCase() + topCategory.slice(1),
      });
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, color: "text-primary" },
    { label: "Open", value: stats.open, color: "text-priority-4" },
    { label: "Avg Response", value: stats.avgResponse, color: "text-priority-2" },
    { label: "Top Category", value: stats.topCategory, color: "text-accent-foreground" },
  ];

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-md bg-accent/30 p-3"
              style={{ borderRadius: index % 2 === 0 ? "8px" : "6px" }}
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
