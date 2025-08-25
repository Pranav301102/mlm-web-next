'use client';

export default function EarlyAccessSection() {
  const scrollToHero = () => {
    const element = document.getElementById('app-launch');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="early-access" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Be Among the First 1,000 Founding Mums
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get exclusive early access to our personal concierge app and help shape the future of how working mums thrive. 
            Plus, unlock your special Founding Mum's Badge.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-white rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">👑</span>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Lifetime Special Pricing</h4>
                <p className="text-sm text-gray-600">Exclusive rates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">⚡</span>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Free Early Access</h4>
                <p className="text-sm text-gray-600">Beta testing privileges</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-xl text-white">👥</span>
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Shape the Product</h4>
                <p className="text-sm text-gray-600">Voting Rights on features</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto pt-10">
          <button 
            onClick={scrollToHero}
            className="w-full bg-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-200"
          >
            Get Early Access
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Click above to join our exclusive early access waitlist
          </p>
        </div>
      </div>
    </section>
  );
}
