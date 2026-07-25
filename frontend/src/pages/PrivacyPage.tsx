import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center space-x-3 text-brand-400">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        </div>
        <p className="text-sm text-slate-400">Last updated: July 2026</p>

        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              LinkForge collects standard account information (such as email address and hashed passwords) required for user authentication and management. We also record aggregate analytics for shortened URLs, including referrer URLs, user-agent details, timestamps, and approximate location (country/city) based on IP address.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. How Information is Used</h2>
            <p>
              Account data is strictly used to provide services, prevent abuse, authenticate sessions, and deliver analytics reports. We do not sell or share personal credentials or user tracking data with third-party advertising networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Data Security & Integrity</h2>
            <p>
              We implement industry-standard encryption, HTTPS, bcrypt password hashing, and secure token storage to safeguard your data against unauthorized access or disclosure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Abuse Prevention & Compliance</h2>
            <p>
              URLs created using LinkForge are monitored to prevent phishing, malware distribution, and illegal content. Suspicious links will be terminated without prior notice.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
