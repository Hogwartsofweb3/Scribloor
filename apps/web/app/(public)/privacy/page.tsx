import React from 'react';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { Shield, Eye, Database, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Solscribe',
  description: 'Privacy Policy for the Solscribe newsletter and subscription platform.',
};

export default function PrivacyPage() {
  const lastUpdated = 'May 26, 2026';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Nav />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Policy</span>
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Learn how we collect, use, and safeguard your information on Solscribe.
            </p>
            <div className="mt-4 text-xs font-semibold text-slate-400 bg-slate-100 py-1.5 px-3 rounded-full inline-block">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Privacy Warning Box */}
          <div className="mb-12 p-5 bg-indigo-50 border border-indigo-100 rounded-3xl flex gap-4 items-start">
            <Shield className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-indigo-900 text-sm mb-1">Public Blockchain Notice</h3>
              <p className="text-xs text-indigo-800 leading-relaxed">
                By design, the Solana blockchain is a public, immutable ledger. Any subscription transactions,
                wallet addresses, tips, and referral rewards recorded on-chain are entirely public, transparent, 
                and cannot be altered, erased, or anonymized by Solscribe.
              </p>
            </div>
          </div>

          {/* Table of Contents & Content */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm space-y-12 text-slate-700 leading-relaxed">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">01.</span> Introduction
              </h2>
              <p>
                At Solscribe, Inc. (&quot;Solscribe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we are 
                committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your personal data when you interact with our platform, connect your cryptographic wallet, 
                or subscribe to newsletters.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">02.</span> Information We Collect
              </h2>
              <p>
                We collect information directly from you, automatically through your interactions, and from blockchain networks:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-900">Cryptographic Wallet Address:</strong> When you connect your 
                  wallet, we collect and store your public wallet address. This serves as your primary account identifier.
                </li>
                <li>
                  <strong className="text-slate-900">Email Address:</strong> If you sign up using our authentication partner, 
                  Privy, or subscribe to receive creator updates, we collect your email address to deliver newsletters and account notifications.
                </li>
                <li>
                  <strong className="text-slate-900">Creator Profile Information:</strong> If you set up a publication, 
                  we collect your publication name, slug, description, and settings.
                </li>
                <li>
                  <strong className="text-slate-900">On-Chain Transaction Data:</strong> We monitor public transaction 
                  hashes corresponding to subscriptions, tips, and referral reward logs to verify access levels.
                </li>
                <li>
                  <strong className="text-slate-900">Device and Usage Information:</strong> We collect details about 
                  your IP address, browser type, operating system, and interaction logs (e.g., referral link usage) 
                  to improve security and performance.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">03.</span> How We Use Your Information
              </h2>
              <p>
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-900">Service Delivery:</strong> To authenticate your account, check 
                  subscription access control (including NFT token-gating), and host creator publications.
                </li>
                <li>
                  <strong className="text-slate-900">Communications:</strong> To send transactional emails, welcome notifications, 
                  and publisher newsletters via our email delivery provider (Resend).
                </li>
                <li>
                  <strong className="text-slate-900">Referrals &amp; Growth:</strong> To track creator referral cookies (30-day lifecycle) 
                  and process eligible rewards.
                </li>
                <li>
                  <strong className="text-slate-900">Caching &amp; Optimization:</strong> To run top-earning and top-subscriber leaderboards.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">04.</span> Sharing of Information
              </h2>
              <p>
                We value your privacy and do not sell your personal data to third parties. We share your information in these limited scenarios:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-900">With Creators:</strong> If you subscribe to a creator&apos;s publication, 
                  the creator gains access to your wallet address and email address (if shared) in their dashboard in order to publish and manage their newsletters.
                </li>
                <li>
                  <strong className="text-slate-900">With Service Providers:</strong> We share email addresses and templates 
                  with email delivery systems (Resend) and use authentication services (Privy) to facilitate logins.
                </li>
                <li>
                  <strong className="text-slate-900">Public Blockchain Records:</strong> As noted, any USDC or Solana network transactions 
                  are public record and accessible on block explorers.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">05.</span> Your Preferences &amp; Opt-Outs
              </h2>
              <p>
                We believe in giving you control over your public presence on Solscribe:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-900">Leaderboard Opt-Out:</strong> Creators can opt-out of having their earnings 
                  or publication names highlighted in the public leaderboard from their settings dashboard.
                </li>
                <li>
                  <strong className="text-slate-900">Subscriber Wall Opt-Out:</strong> Readers can toggle settings to prevent 
                  their truncated wallet addresses from being shown on publication landing pages.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">06.</span> Security and Storage
              </h2>
              <p>
                We employ industry-standard security measures, including HTTPS encryption, secure database hosting, and Upstash Redis 
                access tokens. However, please remember that no method of transmission or electronic storage is 
                100% secure. You are responsible for keeping your wallet private key secret and secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">07.</span> Cookies and Local Storage
              </h2>
              <p>
                We use cookies and browser local storage to maintain session states and user preferences:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-900">Referral Cookies:</strong> A cookie storing referral attribution codes 
                  is set when clicking a creator&apos;s referral link, expiring after 30 days.
                </li>
                <li>
                  <strong className="text-slate-900">Theme Settings:</strong> Your choice of dark or light theme is stored in 
                  your browser&apos;s local storage to render correctly on subsequent visits.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">08.</span> Global Privacy Rights
              </h2>
              <p>
                Depending on your location (such as the European Economic Area or California), you may have certain rights under the 
                General Data Protection Regulation (GDPR) or the California Consumer Privacy Act (CCPA). These include the right to 
                request access to your data, correction of inaccurate data, or deletion of database records. 
              </p>
              <p>
                Please note that we have no technical ability to modify, erase, or mask transactions or smart contracts recorded 
                directly on the Solana blockchain.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">09.</span> Changes to this Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
                on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">10.</span> Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please reach out to us at{' '}
                <a href="mailto:privacy@solscribe.app" className="text-indigo-600 hover:underline">
                  privacy@solscribe.app
                </a>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
