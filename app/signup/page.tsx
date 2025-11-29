"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, X, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    state: "",
    language: "",
  });

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const languages = [
    "English",
    "Hindi",
    "Bengali",
    "Telugu",
    "Marathi",
    "Tamil",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Punjabi",
    "Odia",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <span className="text-xl font-bold text-black">S</span>
          </div>
          <span className="text-white text-xl font-semibold">Shreeshai</span>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-2xl">
          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome to Shreeshai
            </h1>
            <p className="text-gray-400 text-sm">
              Create your account to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-gray-300 text-sm font-medium"
              >
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                required
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            {/* Email */}
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
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                required
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            {/* Password */}
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                required
                className="bg-zinc-950 border-zinc-800 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            {/* State Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="text-gray-300 text-sm font-medium"
              >
                Select Your State
              </Label>
              <Select
                value={formData.state}
                onValueChange={(value) =>
                  setFormData({ ...formData, state: value })
                }
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-12 rounded-lg focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700">
                  <SelectValue placeholder="Choose your state" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-60">
                  {indianStates.map((state) => (
                    <SelectItem
                      key={state}
                      value={state}
                      className="focus:bg-zinc-800"
                    >
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="language"
                className="text-gray-300 text-sm font-medium"
              >
                Select Preferred Language
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                Choose your preferred language for the application
              </p>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-12 rounded-lg focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700">
                  <SelectValue placeholder="Choose your preferred language" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {languages.map((language) => (
                    <SelectItem
                      key={language}
                      value={language}
                      className="focus:bg-zinc-800"
                    >
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profile Photo Section */}
            <div className="space-y-3 pt-4">
              <Label className="text-gray-300 text-sm font-medium">
                Profile Photo
              </Label>
              <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-6">
                  {/* Preview */}
                  <div className="shrink-0">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Preview
                    </p>
                  </div>

                  {/* Upload Buttons */}
                  <div className="flex-1 flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="camera-upload"
                    />

                    <Button
                      type="button"
                      onClick={() =>
                        document.getElementById("camera-upload")?.click()
                      }
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg font-medium transition-all duration-200 shadow-lg"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </Button>

                    <Button
                      type="button"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                      className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 text-white border-0 rounded-lg font-medium transition-all duration-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>

                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={!profileImage}
                      className="flex-1 h-12 bg-red-600/10 hover:bg-red-600/20 text-red-400 border-0 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-gray-100 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
            >
              {loading ? "Creating Account..." : "Create account"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white hover:text-gray-300 font-medium transition-colors"
              >
                Login
              </Link>
            </p>
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors inline-block"
            >
              Quick access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
