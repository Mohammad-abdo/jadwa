import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";
import { getCookie, setCookie, removeCookie } from "../utils/cookies";
import { message } from "antd";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getCookie("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getProfile();
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      // Only logout if it's a real auth error, not a connection error
      if (error.message && error.message.includes("Unauthorized")) {
        logout(); // Clear invalid token
      } else {
        // For connection errors, keep the token but mark as not authenticated
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      // Store tokens in cookies
      setCookie("accessToken", response.tokens.accessToken, 7);
      setCookie("refreshToken", response.tokens.refreshToken, 7);
      
      // Also store in localStorage for backward compatibility (will be removed later)
      localStorage.setItem("accessToken", response.tokens.accessToken);
      localStorage.setItem("refreshToken", response.tokens.refreshToken);

      // Set user
      setUser(response.user);
      setIsAuthenticated(true);

      message.success("Login successful!");
      return { success: true, user: response.user };
    } catch (error) {
      message.error(error.message || "Login failed");
      return { success: false, error: error.message };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);

      // Store tokens in cookies
      setCookie("accessToken", response.tokens.accessToken, 7);
      setCookie("refreshToken", response.tokens.refreshToken, 7);
      
      // Also store in localStorage for backward compatibility
      localStorage.setItem("accessToken", response.tokens.accessToken);
      localStorage.setItem("refreshToken", response.tokens.refreshToken);

      // Set user
      setUser(response.user);
      setIsAuthenticated(true);

      message.success("Registration successful!");
      return { success: true, user: response.user };
    } catch (error) {
      message.error(error.message || "Registration failed");
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Remove from cookies
    removeCookie("accessToken");
    removeCookie("refreshToken");
    
    // Remove from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    setUser(null);
    setIsAuthenticated(false);
    message.info("Logged out successfully");
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
