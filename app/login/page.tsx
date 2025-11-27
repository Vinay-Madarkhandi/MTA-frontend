"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <span className="text-2xl font-bold text-primary-foreground">
                S
              </span>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Shreeshai
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-center">
            <p className="text-muted-foreground">
              Demo: mtauser@gmail.com / mtapass
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
