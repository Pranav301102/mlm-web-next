'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Heart className="text-lg text-white"></Heart>
            </div>
            <span className="text-xl font-bold text-gray-900">Mums Like Me</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('app-launch')} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              App Launch
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('newsletter')} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Newsletter
            </button>
            <a 
              href="https://mumslikeme.beehiiv.com/archive" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Read Articles
            </a>
          </div>

          <div className="hidden md:block">
            <button 
              onClick={() => scrollToSection('app-launch')} 
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
            >
              Get Early Access
            </button>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            <div className="text-xl">
              {isMobileMenuOpen ? '✕' : '☰'}
            </div>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <button 
                onClick={() => scrollToSection('app-launch')} 
                className="block w-full text-left py-2 text-gray-600"
              >
                App Launch
              </button>
              <button 
                onClick={() => scrollToSection('features')} 
                className="block w-full text-left py-2 text-gray-600"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('newsletter')} 
                className="block w-full text-left py-2 text-gray-600"
              >
                Newsletter
              </button>
              <a 
                href="https://mumslikeme.beehiiv.com/archive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-left py-2 text-gray-600"
              >
                Read Articles
              </a>
              <button 
                onClick={() => scrollToSection('early-access')} 
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 w-full mt-4"
              >
                Get Early Access
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
