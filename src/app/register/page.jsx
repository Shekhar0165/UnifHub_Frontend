'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    userid: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ ...formData, userType: tab });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API}send-otp`, {
        email: formData.email
      });
      
      toast({
        title: "Success",
        description: "OTP has been sent to your email",
        duration: 2000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
      setStep(2);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send OTP",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      toast({
        title: "Validation Error",
        description: "Please enter the OTP",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/verify-otp`, {
        code: otp,
        email: formData.email,
      });
      
      toast({
        title: "Success",
        description: "Email verified successfully",
        duration: 2000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
      setStep(3);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "OTP verification failed",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, userid, email, password, confirmPassword } = formData;

    // Validation
    if (!name || !userid || !email || !password || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/register`,
        { name, userid, email, password },
        { withCredentials: true }
      );

      toast({
        title: "Registration successful!",
        description: "Redirecting you to events page...",
        duration: 2000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      setTimeout(() => {
        router.push("/events");
      }, 1500);

    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "An error occurred during registration",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full max-w-md space-y-6">
        {/* Tab Selection */}
        <div className="flex w-full rounded-lg border p-1 gap-1">
          <button
            onClick={() => handleTabChange('individual')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'individual' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
            disabled={isLoading}
          >
            Join as Individual
          </button>
          <button
            onClick={() => handleTabChange('organization')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'organization' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
            disabled={isLoading}
          >
            Join as Organization
          </button>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {step === 1 && "Email Verification"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Create Account"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "First, let's verify your email address"}
              {step === 2 && "Enter the verification code sent to your email"}
              {step === 3 && activeTab === 'individual' 
                ? "Complete your profile to join amazing events"
                : "Set up your organization profile to host events"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="name@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    disabled={isLoading}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
                <p className="text-center text-sm">
                  Didn't receive the code?{' '}
                  <button 
                    type="button"
                    onClick={handleSendOtp}
                    className="text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Resend
                  </button>
                </p>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-4">
                {activeTab === 'organization' ? (
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="Enter organization name" 
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                      required 
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="Enter your full name" 
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                      required 
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="userid">User ID</Label>
                  <Input 
                    id="userid" 
                    name="userid"
                    placeholder="Choose a unique user ID" 
                    value={formData.userid}
                    onChange={handleChange}
                    disabled={isLoading}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    placeholder="Create a password" 
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required 
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    placeholder="Confirm your password" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    required 
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  By joining, you agree to our{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </form>
            )}

            {step === 1 && (
              <p className="text-center text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}