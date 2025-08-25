'use client';

import { useState, useEffect } from 'react';

export default function NewsletterSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const fetchRecentArticles = async () => {
    try {
      // Always use relative URL since frontend and backend are on same server
      const response = await fetch('/api/posts?limit=3');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      // Fallback to static content
      setArticles([
        {
          id: 1,
          title: "Mid-Day Micro-Hacks That Work",
          subtitle: "Five quick resets for busy afternoons",
          web_url: "https://mumslikeme.beehiiv.com/p/mid-day-micro-hacks"
        },
        {
          id: 2,
          title: "Weekend Recharge Rituals",
          subtitle: "Self-care without a babysitter",
          web_url: "https://mumslikeme.beehiiv.com/p/weekend-recharge-rituals"
        },
        {
          id: 3,
          title: "Morning Momentum Builders",
          subtitle: "Start strong even with little ones",
          web_url: "https://mumslikeme.beehiiv.com/p/morning-momentum"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              While You Wait, Read Our Newsletter
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Get bite-sized wisdom, time-saving hacks, and support delivered to your inbox twice a week. 
              Over 2,500 working mums already read our content.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <span className="text-purple-600">📅</span>
                <span className="text-gray-600">Tuesday Time Saver Brief (~2 min)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-purple-600">☕</span>
                <span className="text-gray-600">Friday Recharge Round-up (~3 min)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-purple-600">📧</span>
                <span className="text-gray-600">100% free, opt-out anytime</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h4 className="font-semibold text-gray-900 mb-4">Recent Articles</h4>
            {loading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.slice(0, 3).map((article, index) => (
                  <a 
                    key={article.id || index} 
                    href={article.web_url || `https://mumslikeme.beehiiv.com/archive`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-l-4 border-purple-600 pl-4 hover:bg-gray-100 rounded-r-lg transition-colors duration-200 py-2 -my-2"
                  >
                    <h5 className="font-medium text-gray-900 hover:text-purple-600">{article.title}</h5>
                    <p className="text-sm text-gray-600">{article.subtitle || article.content?.substring(0, 50) + '...'}</p>
                  </a>
                ))}
              </div>
            )}
            <div className="mt-6">
              <a href="https://mumslikeme.beehiiv.com/archive" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-medium hover:underline">
                Browse All Articles →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
