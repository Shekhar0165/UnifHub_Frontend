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
  const [userType, setUserType] = useState('');
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

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
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
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/send-otp`, {
        email: formData.email
      });

      toast({
        title: "Success",
        description: "OTP has been sent to your email",
        duration: 2000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
      setStep(3);
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
      setStep(4);
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
        description: "All required fields must be filled",
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
      // Choose endpoint based on user type
      const endpoint = userType === 'individual'
        ? `${process.env.NEXT_PUBLIC_API}/student/register`
        : `${process.env.NEXT_PUBLIC_API}/org/register`;

      const res = await axios.post(
        endpoint,
        { name, userid, email, password, userType },
        {
          withCredentials: true,
          validateStatus: (status) => status < 400 // Accept 201 as success
        }
      );
      // Check if response contains required data

      document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `refreshToken=${res.data.refreshToken}; path=/; max-age=604800; SameSite=Strict`;
      document.cookie = `UserType=${res.data.user.usertype}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `UserId=${res.data.user.userid}; path=/; max-age=86400; SameSite=Strict`;

      // Store in localStorage as fallback
      localStorage.setItem('UserType', res.data.user.userType);
      localStorage.setItem('UserId', res.data.user.userid);

      toast({
        title: "Registration successful!",
        description: "Redirecting you to events page...",
        duration: 2000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });

      window.location.href = "/";

    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || error.message || "An error occurred during registration",
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

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {step === 1 && "Account Type"}
              {step === 2 && "Email Verification"}
              {step === 3 && "Enter OTP"}
              {step === 4 && "Create Account"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "First, tell us who you are"}
              {step === 2 && "Let's verify your email address"}
              {step === 3 && "Enter the verification code sent to your email"}
              {step === 4 && userType === 'individual'
                ? "Complete your profile to join amazing events"
                : "Set up your organization profile to host events"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => handleUserTypeSelect('individual')}
                  className="h-24 text-lg"
                  variant="outline"
                >
                  I'm an Individual
                </Button>
                <Button
                  onClick={() => handleUserTypeSelect('organization')}
                  className="h-24 text-lg"
                  variant="outline"
                >
                  I'm an Organization
                </Button>
              </div>
            )}

            {step === 2 && (
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

            {step === 3 && (
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

            {step === 4 && (
              <form onSubmit={handleRegister} className="space-y-4">
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


                {/* <div className="space-y-2">
                  <Label htmlFor="university">
                    {userType === 'individual' ? "University" : "Organization Type"}
                  </Label>
                  <Input
                    id="university"
                    name="university"
                    placeholder={userType === 'individual' ? "Enter your university" : "e.g., Club, Company, Non-profit"}
                    value={formData.university}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div> */}


                <Separator className="my-2" />

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

            {step < 4 && (
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