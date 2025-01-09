import { Navigation } from "@/components/Navigation";

const Contact = () => {
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;