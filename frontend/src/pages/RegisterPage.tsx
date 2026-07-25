import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Navbar } from '../components/common/Navbar';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <RegisterForm />
      </main>
    </div>
  );
};
