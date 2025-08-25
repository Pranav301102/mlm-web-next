'use client';

import { useState, useRef, useEffect } from 'react';

export default function EmailSignupForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const emailInputRef = useRef(null);

  // Auto-focus email input when component mounts (simulating "Get Early Access" click)
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleGetEarlyAccessClick = () => {
    if (!consent) {
      alert('Please check the consent box first to receive early access updates.');
      return;
    }
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!consent) {
      alert('Please check the consent box first to receive early access updates.');
      return;
    }
    
    try {
      const response = await fetch('/api/subscribe', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setEmail('');
          setConsent(false);
        }, 3000);
      } else {
        let msg = "Submission failed.";
        try {
          const data = await response.json();
          msg = data.message || msg;
        } catch (_) {}
        alert(`Error: ${msg}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
          <input
            ref={emailInputRef}
            type="email"
            placeholder="Enter your email for early access"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-white/20 text-gray-900 focus:ring-2 focus:ring-white outline-none bg-white/90 backdrop-blur-sm"
            required
          />
          <button 
            type="submit" 
            onClick={!consent ? handleGetEarlyAccessClick : undefined}
            className={`whitespace-nowrap font-bold text-lg px-8 py-3 rounded-lg transition-colors ${
              !consent 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-white text-orange-500 hover:bg-gray-100'
            }`}
            disabled={!email || !consent}
          >
            {isSubmitted ? 'Submitted!' : 'Get Early Access'}
          </button>
        </div>
        
        {/* Consent and Disclaimer */}
        <div className="flex items-start justify-center space-x-2 text-sm">
          <input
            type="checkbox"
            id="hero-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 text-white border-white/30 rounded focus:ring-white bg-white/20"
            required
          />
          <label htmlFor="hero-consent" className="text-white/90 text-left">
            I consent to receive emails and agree to the{' '}
            <a href="/terms" className="text-white hover:underline font-medium">Terms of Use</a>
            {' '}and{' '}
            <a href="/privacy" className="text-white hover:underline font-medium">Privacy Policy</a>.
          </label>
        </div>
        
        {isSubmitted && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-center">
            <p className="text-white font-medium">
              🎉 You're on the list! We'll notify you when early access begins.
            </p>
          </div>
        )}
      </form>

      <div className="flex justify-center">
        <button 
          onClick={() => scrollToSection('features')}
          className="border-2 border-white text-white font-medium text-lg px-8 py-3 mb-4 rounded-lg hover:bg-white/10 transition-colors"
        >
          See Features
        </button>
      </div>
    </>
  );
}