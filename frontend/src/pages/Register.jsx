import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 10v-2a4 4 0 0 0-3-3.87M20 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Join CampusCare to report and track issues.</p>
        </div>

        <form className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="First name" id="firstName" placeholder="John" required />
            <Input label="Last name" id="lastName" placeholder="Doe" required />
          </div>

          <Input label="Email address" id="email" type="email" placeholder="you@example.com" required />
          <Input label="Password" id="password" type="password" placeholder="Create a password" required />
          <Input label="Confirm password" id="confirmPassword" type="password" placeholder="Re-enter your password" required />

          <Button className="w-full" size="lg">Create account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
