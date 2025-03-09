'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordwithToken } from '@/app/(login)/actions';
import { CircleIcon } from 'lucide-react';  // Adjust the import path as necessary

 
      

export default function ResetPassword() {
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<React.ReactNode>('');


  
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (!token) {
      setMessage(<span className="text-red-500">Invalid token. Please try again.</span>);
    }
  }, [token]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setToken(searchParams.get('token'));
  }, []);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage(<span className="text-red-500">Passwords do not match</span>);
      return;
    }
    if (!token) {
      setMessage(<span className="text-red-500">Invalid token. Please try again.</span>);
      return;
    }
    const response = await resetPasswordwithToken(token.toString(), password);
    if (response.success) {
      setMessage('Password has been reset successfully. You will be redirected to the login page.');
      setTimeout(() => {
        window.location.href = '/sign-up';
      }, 3000);
    } else {
      setMessage(<span className="text-red-500">Failed to reset password. Please try again.</span>);
    }
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-purple-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">Nerva Ai</span>
          </Link>
        </div>
      </header>
      <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-purple-500" />
        </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your new password"
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </Label>
              <div className="mt-1">
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
            {message && (
              <div className="text-green-500 text-sm">{message}</div>
            )}
            <div>
              <Button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Reset Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}