import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center space-x-3 text-brand-400">
          <FileText className="w-8 h-8" />
          <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        </div>
        <p className="text-sm text-slate-400">Last updated: July 2026</p>

        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Acceptable Use Policy</h2>
            <p>
              LinkForge is provided for legitimate URL management, link shortening, and custom analytics. Users are strictly prohibited from using LinkForge to shorten links that lead to phishing sites, malware distribution, illegal content, spam, or scams.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Termination & Suspensions</h2>
            <p>
              LinkForge reserves the right to disable, suspend, or permanently remove any account or shortened link found violating our security and safety standards.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
