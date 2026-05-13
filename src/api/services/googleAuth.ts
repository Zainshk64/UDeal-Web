// ============================================
// GOOGLE AUTH — CLEAN SINGLE FUNCTION
// No Firebase needed. Uses Google Identity Services (GIS) directly.
// Only calls: POST /auth/googleauth
// ============================================


import { toast } from "sonner";
import apiClient from "./api";
import { setStoredToken, setUserData } from "@/src/utils/storage";

// ── Types ──────────────────────────────────────────────────────────────────

interface AuthResponse {
  returnCode: boolean;
  returnText?: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: number;
  email?: string;
  fullName?: string;
  name?: string;
  mobNumber?: string;
  cityName?: string;
  cityId?: number;
  userType?: string;
  promocode?: string;
  userPromoCode?: string;
  imageurl?: string;
  totalReferrals?: number;
}

// ── GIS credential shape ───────────────────────────────────────────────────

interface GoogleCredentialResponse {
  credential: string; // JWT id_token from Google
  select_by: string;
}

// ── Load GIS script once ───────────────────────────────────────────────────

let gisLoaded = false;

function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gisLoaded || (window as any).google?.accounts) {
      gisLoaded = true;
      return resolve();
    }
    const existing = document.getElementById("google-gis-script");
    if (existing) {
      existing.addEventListener("load", ()=> resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => { gisLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load Google Identity Services script"));
    document.head.appendChild(script);
  });
}

// ── Prompt Google credential via One Tap / popup ───────────────────────────

function promptGoogleCredential(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      return reject(new Error("Google Identity Services not loaded"));
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleCredentialResponse) => {
        if (response?.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("No credential returned from Google"));
        }
      },
      ux_mode: "popup",           // keeps the flow in a popup — no redirects
      cancel_on_tap_outside: true,
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap was suppressed — fall back to the sign-in button popup
        const tempDiv = document.createElement("div");
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);

        google.accounts.id.renderButton(tempDiv, {
          type: "standard",
          size: "large",
          theme: "outline",
        });

        const btn = tempDiv.querySelector("div[role='button']") as HTMLElement | null;
        if (btn) {
          btn.click();
          document.body.removeChild(tempDiv);
        } else {
          document.body.removeChild(tempDiv);
          reject(new Error("Could not render Google sign-in button"));
        }
      }
    });
  });
}

// ── Main export — the ONLY function you need to call ──────────────────────

/**
 * Sign in with Google.
 * Loads GIS, prompts the Google account picker, sends the credential
 * to POST /auth/googleauth, stores tokens, and updates user state.
 *
 * Usage:
 *   const result = await signInWithGoogle();
 *   if (result) router.push("/dashboard");
 */
export async function signInWithGoogle(): Promise<AuthResponse | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!clientId || clientId === "your_google_web_client_id_here") {
    toast.error("Google Sign-In not configured", {
      description: "Set NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env.local file.",
    });
    console.error(
      "[Auth] Missing NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID.\n" +
      "Get it from: https://console.cloud.google.com → APIs & Services → Credentials"
    );
    return null;
  }

  try {
    // 1. Load GIS script
    await loadGoogleIdentityScript();

    // 2. Open Google account picker → get id_token
    const credential = await promptGoogleCredential(clientId);

    // 3. Send to YOUR backend — the only API call
    const { data } = await apiClient.post<AuthResponse>("/auth/googleauth", {
      firebaseIdToken: credential, // backend expects this field name
    });

    // 4. Handle backend response
    if (!data.returnCode || !data.accessToken) {
      toast.error("Google login failed", {
        description: data.returnText || "Please try again.",
      });
      return null;
    }

    // 5. Store tokens
    setStoredToken(data.accessToken, "access");
    if (data.refreshToken) {
      setStoredToken(data.refreshToken, "refresh");
    }

    // 6. Store user data
    setUserData({
      userId:        data.userId        ?? undefined,
      email:         data.email         || undefined,
      fullName:      data.fullName      || data.name,
      name:          data.name          || data.fullName,
      mobNumber:     data.mobNumber,
      cityName:      data.cityName,
      cityId:        data.cityId        ?? undefined,
      userType:      data.userType,
      promocode:     data.promocode     ?? data.userPromoCode,
      imageurl:      data.imageurl,
      totalReferrals: data.totalReferrals || 0,
      emailVerified: true,
    });

    // 7. Show success toast
    const displayName = data.name || data.fullName || "User";
    const needsCity = !data.cityId || data.cityId === 0;

    if (needsCity) {
      toast.info(`Welcome, ${displayName}!`, {
        description: "Please set your city in your profile to explore listings.",
      });
    } else {
      toast.success(`Welcome back, ${displayName}!`, {
        description: "Logged in successfully.",
      });
    }

    return data;
  } catch (error: any) {
    const message =
      error?.response?.data?.returnText ||
      error?.message ||
      "Google sign-in failed";

    // Don't show toast for user-cancelled sign-in
    const cancelled =
      message.toLowerCase().includes("cancel") ||
      message.toLowerCase().includes("dismiss") ||
      message.toLowerCase().includes("suppressed");

    if (!cancelled) {
      toast.error("Google sign-in error", { description: message });
    }

    console.error("[Auth] Google sign-in error:", error);
    return null;
  }
}