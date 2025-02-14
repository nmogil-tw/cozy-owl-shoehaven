import { Navigation } from "@/components/Navigation";
import { AssistantChat } from "@twilio-alpha/assistants-react";
import { useEffect, useState } from "react";
import { twilioApi } from "@/integrations/twilio";

const TWILIO_ASSISTANT_SID = import.meta.env.VITE_TWILIO_ASSISTANT_SID;

const Contact = () => {
  const [token, setToken] = useState<string | null>(null);
  const [conversationSid, setConversationSid] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load existing conversation SID from localStorage
    const savedConversationSid = localStorage.getItem("CONVERSATIONS_SID");
    if (savedConversationSid) {
      setConversationSid(savedConversationSid);
    }

    const fetchToken = async () => {
      try {
        console.log('Fetching chat token...');
        const response = await twilioApi.chat.generateToken();
        console.log('Full response from generateToken:', response);
        
        if (!response.success) {
          throw new Error(`API call failed: ${response.error}`);
        }
        
        if (!response.data?.token) {
          console.error('Response data:', response.data);
          throw new Error('Token missing from response');
        }

        console.log('Token received:', response.data.token);
        setToken(response.data.token);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    fetchToken();
  }, []);

  const saveConversationSid = (sid: string) => {
    console.log('Saving conversation SID:', sid);
    localStorage.setItem("CONVERSATIONS_SID", sid);
    setConversationSid(sid);
  };

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

              {error ? (
                <div className="text-red-600 p-4 rounded bg-red-50">
                  Error loading chat: {error}
                </div>
              ) : token && TWILIO_ASSISTANT_SID ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h2>
                  <div style={{ minHeight: '400px' }}>
                    <AssistantChat 
                      token={token}
                      assistantSid={TWILIO_ASSISTANT_SID}
                      conversationSid={conversationSid}
                      onConversationSetup={saveConversationSid}
                      onError={(error) => {
                        console.error('AssistantChat error:', error);
                        setError(error instanceof Error ? error.message : String(error));
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 p-4">
                  Loading chat...
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