'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, KeyRound, Check } from 'lucide-react';
import Link from 'next/link';

const page = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Add email verification logic here
    setStep(2);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    // Add OTP verification logic here
    setStep(3);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Add password update logic here
    // Redirect to login page after success
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" /> Send Reset Link
            </Button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to {email}
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full"
            >
              <Check className="mr-2 h-4 w-4" /> Verify OTP
            </Button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
            >
              <KeyRound className="mr-2 h-4 w-4" /> Reset Password
            </Button>
          </form>
        );
    }
  };

  const stepTitles = {
    1: "Reset Password",
    2: "Verify OTP",
    3: "Create New Password"
  };

  const stepDescriptions = {
    1: "Enter your email to receive a verification code",
    2: "Enter the verification code sent to your email",
    3: "Create a new password for your account"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="text-2xl font-bold">
                {stepTitles[step]}
              </CardTitle>
              <CardDescription>
                {stepDescriptions[step]}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link
              href="/login" 
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default page;