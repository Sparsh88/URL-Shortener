import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};
