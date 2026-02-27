"use client";

import { useEffect, useRef } from "react";
import { initPush, onToken } from "../component/push";
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

export default function AppInit() {
  // Store last token to prevent duplicate API calls
  const lastTokenRef = useRef(null);

  useEffect(() => {
    // Run only on Android / iOS (not web)
    if (!Capacitor.isNativePlatform()) return;

    // Initialize push notification setup
    initPush();

    // Listen for push token
    const unsubscribe = onToken(async (token) => {
      if (!token) return;

      // Prevent duplicate saves
      if (lastTokenRef.current === token) return;
      lastTokenRef.current = token;

      // First check if user is banned
      const isBanned = await checkBanned(token);
      if (isBanned) return;

      // Save token if not banned
      await saveToken(token);
    });

    // Cleanup listener on unmount
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  /**
   * Check if user is banned before saving token
   */
  const checkBanned = async (token) => {
    try {
      // Get stored user access token
      const { value: userId } = await Preferences.get({
        key: "access_token",
      });

      if (!userId) return true; // If no user, stop process

      // For GET request, use "params"
      const response = await axios.get("/api-m/checkBaned", {
        params: {
          token,
          userId,
        },
      });

      if (response.data?.banned) {
        console.warn("🚫 User is banned from receiving push notifications");

        window.location.href = "/banned";

        return true;
      }

      return false;
    } catch (err) {
      console.error("❌ Failed to check banned status", err);
      return true; // Fail-safe: block saving if error happens
    }
  };

  /**
   * Save push token to backend
   */
  const saveToken = async (token) => {
    try {
      const { value: userId } = await Preferences.get({
        key: "access_token",
      });

      if (!userId) return;

      await axios.post("/api-m/saveToken", {
        token,
        userId,
        platform: Capacitor.getPlatform(), // android / ios
      });

      console.log("✅ Push token saved:", token);
    } catch (err) {
      console.error("❌ Failed to save push token", err);
    }
  };

  return null;
}