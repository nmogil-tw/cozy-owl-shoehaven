import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: { token } } = await supabase.functions.invoke('generate-twilio-token');
        
        // Initialize Twilio Flex WebChat
        const { Manager } = await import('@twilio/flex-webchat-ui');
        const manager = await Manager.create({
          flexFlowSid: process.env.TWILIO_FLEX_FLOW_SID,
          chatFriendlyName: 'Customer',
          context: {
            customerName: 'Customer'
          }
        });

        // Configure and create the WebChat
        const configuration = {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          flexFlowSid: process.env.TWILIO_FLEX_FLOW_SID,
          context: {
            customerName: 'Customer'
          }
        };

        // Add the Flex WebChat to the page
        const { createWebChat } = await import('@twilio/flex-webchat-ui');
        await createWebChat(configuration);
        
        const container = document.getElementById('flex-webchat-container');
        if (container) {
          container.style.height = '600px';
          container.style.width = '400px';
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

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