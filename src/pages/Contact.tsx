import { Navigation } from "@/components/Navigation";
import { AssistantChat } from "@twilio-alpha/assistants-react";
import { useEffect, useState } from "react";
import { twilioApi } from "@/integrations/twilio";

// Get Assistant SID from environment variables
const TWILIO_ASSISTANT_SID = import.meta.env.VITE_TWILIO_ASSISTANT_SID;

const Contact = () => {
  const [token, setToken] = useState<string | null>(null);
  const [conversationSid, setConversationSid] = useState<string | undefined>();

  useEffect(() => {
    // Load existing conversation SID from localStorage
    setConversationSid(localStorage.getItem("CONVERSATIONS_SID") || undefined);

    const fetchToken = async () => {
      try {
        console.log('Fetching chat token...');
        console.log('Assistant SID:', TWILIO_ASSISTANT_SID);
        const response = await twilioApi.chat.generateToken();
        
        if (!response.success || !response.data?.token) {
          console.error('Failed to generate token:', response.error || 'No token in response');
          return;
        }

        console.log('Token received successfully');
        setToken(response.data.token);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    fetchToken();
  }, []);

  const saveConversationSid = (sid: string) => {
    localStorage.setItem("CONVERSATIONS_SID", sid);
  };

  // Log when the component attempts to render AssistantChat
  console.log('Rendering Contact component, token status:', token ? 'present' : 'not present');

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

              {token && TWILIO_ASSISTANT_SID ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h2>
                  <div style={{ minHeight: '400px' }}>
                    <AssistantChat 
                      token={token}
                      assistantSid={TWILIO_ASSISTANT_SID}
                      conversationSid={conversationSid}
                      onConversationSetup={saveConversationSid}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">
                    {!token && 'Loading chat...'}
                    {!TWILIO_ASSISTANT_SID && 'Assistant configuration missing.'}
                  </p>
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