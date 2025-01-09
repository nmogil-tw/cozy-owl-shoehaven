import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";

const Return = () => {
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Fetching order details for:", orderId);
      // First get the order details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        throw orderError;
      }

      if (!order) {
        toast({
          title: "Order not found",
          description: "Please check the order ID and try again",
          variant: "destructive",
        });
        return;
      }

      console.log("Creating return for order:", order);
      // Create the return
      const { data: returnData, error: returnError } = await supabase
        .from("returns")
        .insert({
          order_id: order.id,
          customer_id: order.customer_id,
          reason: reason,
          status: "pending",
          refund_amount: order.total_amount,
        })
        .select()
        .single();

      if (returnError) {
        console.error("Error creating return:", returnError);
        throw returnError;
      }

      console.log("Updating order with return info:", returnData);
      // Update the order with return information
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          return_id: returnData.id,
          return_status: "pending",
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw updateError;
      }

      toast({
        title: "Return created successfully",
        description: "Your return request has been submitted",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error processing return:", error);
      toast({
        title: "Error creating return",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create Return</h1>
        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Order ID</label>
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              placeholder="Enter your order ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reason for Return</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Please explain why you want to return this order"
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Submit Return Request"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Return;