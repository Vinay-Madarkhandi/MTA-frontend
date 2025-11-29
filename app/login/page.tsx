"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
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
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <span className="text-xl font-bold text-black">S</span>
            </div>
            <span className="text-white text-xl font-semibold">Shreeshai</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Welcome back!
            </h1>
            <p className="text-gray-400 text-sm">
              We empower developers and technical teams to create, simulate, and
              manage AI-driven workflows visually
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-300 text-sm font-medium"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="youremail@yourdomain.com"
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-gray-300 text-sm font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-gray-100 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-500">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <defs>
                  <linearGradient
                    id="appleGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#A3AAAE", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#5C6266", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#appleGradient)"
                  d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                />
              </svg>
            </Button>
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <span className="text-gray-500 text-sm">
              Already have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>

          {/* Demo Credentials */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
            <p className="text-gray-400 text-xs">
              Demo: mtauser@gmail.com / mtapass
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Video/Media Section */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-16 bg-zinc-950">
        <div className="w-full h-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-linear-to-br from-green-900/20 via-purple-900/20 to-pink-900/20 relative">
          {/* Video Container - You can replace this with actual video */}
          <div className="absolute inset-0 flex items-center justify-center">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-2xl"
            >
              <source src="/logovideo.mp4" type="video/mp4" />
              {/* Fallback content */}
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-green-900/20 via-purple-900/20 to-pink-900/20">
                <div className="text-center space-y-4 p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm font-medium">
                    Product Company
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm font-medium ml-2">
                    Cloud Management
                  </div>
                  <div className="mt-8 max-w-md mx-auto">
                    <p className="text-white text-lg leading-relaxed">
                      Acme Pro Components have completely changed how we work.
                      What used to take hours every week is now fully automated.
                    </p>
                    <div className="mt-6 text-gray-400">
                      <p className="font-semibold text-white">Gina Clinton</p>
                      <p className="text-sm">Head of Product, Acme Inc.</p>
                    </div>
                  </div>
                </div>
              </div>
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}
