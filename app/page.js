import Navigation from './components/Navigation';
import AppLaunchHero from './components/AppLaunchHero';
import EarlyAccessSection from './components/EarlyAccessSection';
import AppFeaturesSection from './components/AppFeaturesSection';
import NewsletterSection from './components/NewsletterSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <AppLaunchHero />
      <EarlyAccessSection />
      <AppFeaturesSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
