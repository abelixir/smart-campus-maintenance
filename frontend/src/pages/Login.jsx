import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7.5A2.5 2.5 0 0 1 5.5 5H18.5A2.5 2.5 0 0 1 21 7.5V21M9 21V13H15V21M7 9h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage campus issues efficiently.</p>
        </div>

        <form className="space-y-5">
          <Input label="Email address" id="email" type="email" placeholder="you@example.com" required />
          <Input label="Password" id="password" type="password" placeholder="Enter your password" required />

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Remember me
            </label>
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
              Need an account?
            </Link>
          </div>

          <Button className="w-full" size="lg">Sign In</Button>
        </form>
      </div>
    </div>
  );
}
