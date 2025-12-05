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
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const insertData: {
        sender: string;
        channel: string;
        message: string;
        status: "open";
        category?: "question" | "request" | "complaint" | "feedback" | "other";
        priority?: "1" | "2" | "3" | "4" | "5";
      } = {
        sender,
        channel,
        message,
        status: "open",
      };
      
      if (category) insertData.category = category as typeof insertData.category;
      if (priority) insertData.priority = priority as typeof insertData.priority;
      
      const { error } = await supabase.from("queries").insert(insertData);

      if (error) throw error;

      toast({
        title: "Query submitted",
        description: "Your query has been successfully submitted.",
      });

      // Reset form
      setSender("");
      setChannel("");
      setMessage("");
      setCategory("");
      setPriority("");
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Low)</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3 (Normal)</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5 (Urgent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            Submit Query
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
