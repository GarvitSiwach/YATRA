import type { Metadata } from 'next';

import AuthFormShell from '@/components/auth-form-shell';
import Navbar from '@/components/navbar';
import SignupForm from '@/components/signup-form';

export const metadata: Metadata = {
  title: 'Signup'
};

export default function SignupPage(): JSX.Element {
  return (
    <>
      <Navbar />
      <AuthFormShell
        title="Create your account"
        subtitle="Start planning intentional journeys with YĀTRA."
        altHref="/login"
        altLabel="Log in"
        altText="Already have an account?"
      >
        <SignupForm />
      </AuthFormShell>
    </>
  );
}
