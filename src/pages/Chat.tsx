import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log("Fetching Twilio token...");
        const { data, error } = await supabase.functions.invoke('generate-twilio-token');
        
        if (error) {
          console.error("Error fetching token:", error);
          throw error;
        }

        if (!data?.token) {
          console.error("No token received from edge function");
          throw new Error("Failed to get chat token");
        }

        console.log("Token received successfully");

        // Configure and create the WebChat
        const configuration = {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          flexFlowSid: process.env.TWILIO_FLEX_FLOW_SID,
          token: data.token,
          context: {
            customerName: 'Customer'
          }
        };

        console.log("Initializing WebChat with configuration");
        
        // Add the Flex WebChat to the page
        const { createWebChat } = await import('@twilio/flex-webchat-ui');
        await createWebChat(configuration);
        
        const container = document.getElementById('flex-webchat-container');
        if (container) {
          container.style.height = '600px';
          container.style.width = '400px';
        }

        console.log("Chat initialized successfully");
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Chat Error",
          description: "Failed to initialize chat. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Chat with Us</h1>
        {isLoading ? (
          <div>Loading chat...</div>
        ) : (
          <div id="flex-webchat-container" className="w-full max-w-lg mx-auto" />
        )}
      </main>
    </div>
  );
};

export default Chat;