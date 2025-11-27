"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../lib/api/auth";
import { apiClient } from "../lib/api-client";
import { User, LoginRequest, RegisterRequest, AuthResponse } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response: AuthResponse = await authApi.login(data);

      const userData: User = {
        email: response.email,
        name: response.name,
        photoDataUrl: response.photoDataUrl,
      };

      setToken(response.token);
      setUser(userData);

      // Store in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(userData));
      apiClient.setToken(response.token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response: AuthResponse = await authApi.register(data);

      const userData: User = {
        email: response.email,
        name: response.name,
        photoDataUrl: response.photoDataUrl,
      };

      setToken(response.token);
      setUser(userData);

      // Store in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(userData));
      apiClient.setToken(response.token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
