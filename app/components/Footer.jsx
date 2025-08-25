import { Heart, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
    try {
      return (
        <footer className="bg-[var(--text-primary)] text-white" data-name="footer" data-file="components/Footer.js">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
                    <div className="icon-heart text-lg text-white"></div>
                  </div>
                  <span className="text-xl font-bold">Mums Like Me</span>
                </div>
                <p className="text-gray-300 mb-6 max-w-md">
                  The first personal concierge app designed specifically for working mums. 
                  Navigate chaos, advance your career, strengthen finances, and nurture wellbeing.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                   <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                   <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
  
              <div>
                <h4 className="font-semibold mb-4">App Launch</h4>
                <ul className="space-y-2">
                  <li><a href="#early-access" className="text-gray-300 hover:text-white transition-colors">Early Access</a></li>
                  <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Release Notes</a></li>
                </ul>
              </div>
  
              <div>
                <h4 className="font-semibold mb-4">Newsletter</h4>
                <ul className="space-y-2">
                  <li><a href="/newsletter.html" className="text-gray-300 hover:text-white transition-colors">Read Articles</a></li>
                  <li><a href="#newsletter" className="text-gray-300 hover:text-white transition-colors">Subscribe</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
  
            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-gray-300">
                © 2025 Mums Like Me. All rights reserved. Made with ❤️ for working mothers everywhere.
              </p>
            </div>
          </div>
        </footer>
      );
    } catch (error) {
      console.error('Footer component error:', error);
      return null;
    }
  }
  