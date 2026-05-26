import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { PainSection } from '@/components/landing/PainSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { VaultSection } from '@/components/landing/VaultSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Solscribe - Your writing. Your readers. Your money.',
  description: 'Publish newsletters and get paid in USDC instantly. Leave Substack and keep 96% of your revenue.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-indigo-200 selection:text-indigo-900">
      <Nav />
      <main>
        <Hero />
        <PainSection />
        <HowItWorks />
        <Features />
        <VaultSection />
        <Testimonials />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
