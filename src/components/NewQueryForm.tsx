import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const NewQueryForm = () => {
  const [sender, setSender] = useState("");
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call edge function to tag and prioritize with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "tag-query",
        {
          body: { message },
        }
      );

      if (aiError) throw aiError;

      // Insert the query with AI-generated tags
      const { error: insertError } = await supabase.from("queries").insert({
        sender,
        channel,
        message,
        category: aiData.category || "other",
        priority: aiData.priority?.toString() || "3",
        status: "open",
      });

      if (insertError) throw insertError;

      toast({
        title: "Query submitted",
        description: `AI categorized as "${aiData.category}" with priority ${aiData.priority}`,
      });

      // Reset form
      setSender("");
      setChannel("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">New Query</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sender">Sender</Label>
            <Input
              id="sender"
              placeholder="email@example.com"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Channel</Label>
            <Select value={channel} onValueChange={setChannel} required>
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter query message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI Processing...
              </>
            ) : (
              "Submit Query"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
