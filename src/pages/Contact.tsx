import { Navigation } from "@/components/Navigation";
import { AssistantChat } from "@twilio-alpha/assistants-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Move the assistant SID to a constant since it's public and safe to expose
const TWILIO_ASSISTANT_SID = "aia_asst_01944282-f2a6-7a76-8235-b9ea699a90b1";

const Contact = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('Fetching token from Edge Function');
        const { data, error } = await supabase.functions.invoke('generate-twilio-token');
        
        if (error) {
          console.error('Error fetching token:', error);
          return;
        }

        if (data?.token) {
          console.log('Token received successfully');
          setToken(data.token);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    fetchToken();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600">We're here to help!</p>
          </header>

          <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Hours</h2>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM PST</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Phone</h2>
                <p className="text-gray-600">+1 (888) 794-1151</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Email</h2>
                <p className="text-gray-600">support@owlshoes.com</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Location</h2>
                <p className="text-gray-600">123 Owl Street<br />San Francisco, CA 94105</p>
              </div>

              {token && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h2>
                  <AssistantChat 
                    token={token} 
                    assistantSid={TWILIO_ASSISTANT_SID} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;