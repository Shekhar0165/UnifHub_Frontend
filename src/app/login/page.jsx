'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster";

export default function Page() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        toast({
          title: "Login successful!",
          description: "Redirecting you to events page...",
          duration: 2000,
          variant: "default",
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        });
        
        setTimeout(() => {
          router.push('/events');
        }, 1500);
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Please check your credentials and try again.",
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
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or User ID</Label>
              <Input 
                id="identifier"
                type="text"
                placeholder="Email or User ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>
          <div className="flex justify-between text-sm text-muted-foreground">
            <button 
              onClick={() => router.push('/forgot-password')} 
              className="hover:underline"
            >
              Forgot password?
            </button>
            <button 
              onClick={() => router.push('/register')} 
              className="hover:underline"
            >
              Create a new account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
