import type { Metadata } from 'next';

import AuthFormShell from '@/components/auth-form-shell';
import LoginForm from '@/components/login-form';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Login'
};

export default function LoginPage(): JSX.Element {
  return (
    <>
      <Navbar />
      <AuthFormShell
        title="Welcome back"
        subtitle="Continue your journey with purpose."
        altHref="/signup"
        altLabel="Create one"
        altText="No account yet?"
      >
        <LoginForm />
      </AuthFormShell>
    </>
  );
}
