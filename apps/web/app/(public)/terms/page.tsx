import React from 'react';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { FileText, Shield, AlertCircle, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Solscribe',
  description: 'Terms of Service for using the Solscribe newsletter and subscription platform.',
};

export default function TermsPage() {
  const lastUpdated = 'May 26, 2026';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Nav />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Service</span>
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Please read these terms carefully before using our platform.
            </p>
            <div className="mt-4 text-xs font-semibold text-slate-400 bg-slate-100 py-1.5 px-3 rounded-full inline-block">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Legal Warning Box */}
          <div className="mb-12 p-5 bg-amber-50 border border-amber-200 rounded-3xl flex gap-4 items-start">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm mb-1">Important Legal Notice</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Solscribe is a web3 platform integrated with the Solana blockchain. By interacting with the platform,
                connecting your cryptocurrency wallet, or making USDC transactions, you acknowledge that blockchain
                transactions are irreversible, and you assume all risks associated with cryptographic systems, 
                smart contracts, and digital assets.
              </p>
            </div>
          </div>

          {/* Table of Contents & Content */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm space-y-12 text-slate-700 leading-relaxed">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">01.</span> Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, connecting a digital wallet, or using Solscribe (&quot;the Platform&quot;), 
                you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
                do not access or use the Platform. These Terms constitute a legally binding agreement between you and 
                Solscribe, Inc. (&quot;Solscribe&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">02.</span> Description of Service
              </h2>
              <p>
                Solscribe is a decentralized-friendly publishing and subscription platform. It enables creators to
                write and publish newsletters, establish subscriptions gated by USDC (a digital stablecoin) or 
                non-fungible tokens (NFTs), receive direct tips, and manage their audience. Readers can connect 
                their cryptographic wallets, subscribe to publications, unlock gated content, and tip creators.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">03.</span> Account &amp; Wallet Security
              </h2>
              <p>
                To utilize the full features of the Platform, you must connect a cryptographic wallet (e.g., using 
                our wallet integration partner, Privy, or directly via Solana browser wallets). You are solely 
                responsible for maintaining the confidentiality and security of your wallet credentials, private keys, 
                and recovery phrases.
              </p>
              <p className="font-semibold text-slate-900">
                Solscribe does not store, manage, or have access to your private keys. We cannot recover lost assets 
                or wallets. Any unauthorized transactions arising from compromised credentials are your sole responsibility.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">04.</span> Fees &amp; Blockchain Transactions
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-slate-900">Platform Fees:</strong> Solscribe charges a fee of 4% of all USDC 
                  subscription payments processed through the Platform. This fee is automatically deducted at the 
                  time of the transaction. Direct tips and referral rewards may have separate structures as announced on the platform.
                </li>
                <li>
                  <strong className="text-slate-900">Gas Fees:</strong> Blockchain interactions (such as processing 
                  subscriptions or tipping) require payment of Solana network transaction fees (&quot;gas fees&quot;). 
                  You are responsible for having sufficient SOL in your wallet to cover these fees.
                </li>
                <li>
                  <strong className="text-slate-900">Non-Refundability:</strong> All transactions processed on the 
                  Solana blockchain are irreversible. Solscribe has no ability to reverse transactions, refund USDC, 
                  or resolve payment disputes. All sales are final.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">05.</span> Creator Terms &amp; Content Licensing
              </h2>
              <p>
                As a creator, you retain all intellectual property rights to the written content, images, and other 
                materials you publish. By uploading or publishing content on Solscribe, you grant us a worldwide, 
                non-exclusive, royalty-free, sublicensable license to host, store, cache, distribute, and display 
                your content solely to perform the services of the Platform.
              </p>
              <p>
                You represent and warrant that you own or have the necessary licenses for all content you publish, 
                and that your content does not violate any third-party rights, including copyrights, trademark rights, 
                privacy rights, or content policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">06.</span> Subscriber &amp; Gating Terms
              </h2>
              <p>
                Subscribers receive access to gated newsletter content subject to maintaining an active subscription 
                status (confirmed on-chain and cached in our database) or holding the required gated NFT collection 
                in their connected wallet. Solscribe does not vet, guarantee, or take responsibility for the quality, 
                frequency, or accuracy of the newsletters published by creators.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">07.</span> Web3 &amp; RPC Disclaimers
              </h2>
              <p>
                Solscribe checks NFT ownership and subscription transactions using decentralized RPC providers (like Helius) 
                and caching mechanisms (Upstash Redis). You acknowledge that network delays, RPC failures, 
                or chain reorganization events may cause temporary delays in content unlocking. Solscribe is not 
                liable for any temporary or permanent loss of access resulting from third-party protocol issues.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">08.</span> Risk Disclosure
              </h2>
              <p>
                You explicitly acknowledge and assume the following risks:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Regulatory risk regarding stablecoins (like USDC) and digital assets.</li>
                <li>Vulnerabilities or exploits in smart contracts or integrated wallet providers.</li>
                <li>Solana network congestion, high gas fees, or network outages.</li>
                <li>Loss of private keys leading to permanent loss of funds or publication ownership.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">09.</span> Prohibited Conduct
              </h2>
              <p>
                You agree not to use the platform for:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Publishing illegal, fraudulent, or harassing content.</li>
                <li>Distributing malware, spam, or engaging in phishing attacks.</li>
                <li>Bypassing content paywalls or attempting to hack the platform&apos;s API.</li>
                <li>Violating any local or international compliance, anti-money laundering, or sanctions regulations.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">10.</span> Limitation of Liability
              </h2>
              <p className="italic">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SOLSCRIBE, INC., ITS DIRECTORS, 
                EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
                PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER 
                INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE, COMPROMISED WALLETS, OR BLOCKCHAIN TRANSACTIONS.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">11.</span> Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                United States, without regard to its conflict of law provisions. Any legal action or proceeding 
                arising under these Terms shall be brought exclusively in courts located in Wilmington, Delaware.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-600 text-lg font-mono">12.</span> Contact Information
              </h2>
              <p>
                For any questions regarding these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@solscribe.app" className="text-indigo-600 hover:underline">
                  legal@solscribe.app
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
