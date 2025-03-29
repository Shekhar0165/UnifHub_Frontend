'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, CheckCircle, AlertCircle, Send, KeyRound, Save } from 'lucide-react';
import Cookies from 'js-cookie';

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/reset/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
          duration: 2000,
          variant: "default",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
        setStep(2);
      } else {
        toast({
          title: "Failed to send OTP",
          description: data.message || "Please check your email and try again.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
    setIsLoading(false);
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/reset/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "OTP Verified!",
          description: "You can now reset your password.",
          duration: 2000,
          variant: "default",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
        setStep(3);
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid OTP. Please try again.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
    setIsLoading(false);
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/reset/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Clear any existing auth cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('UserType');
        Cookies.remove('UserId');

        toast({
          title: "Password Reset Successful!",
          description: "Redirecting to login page...",
          duration: 2000,
          variant: "default",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
        
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset password. Please try again.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Enter your email to receive a verification code' :
             step === 2 ? 'Enter the verification code sent to your email' :
             'Create your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                onClick={sendOtp}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                onClick={verifyOtp}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || !otp}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                onClick={resetPassword}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-muted-foreground hover:underline"
            >
              Back to login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}