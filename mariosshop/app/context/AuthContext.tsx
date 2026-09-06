'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logTransaction } from '../lib/transactions';

export interface User {
  username: string;
  email: string;
  dob?: string;
  isAdmin?: boolean;
  b9chich: number;

  referralCode?: string;
  referredBy?: string | null;

  wallet?: number;
  totalReferralEarnings?: number;
  firstPurchaseCompleted?: boolean;

  // Account recovery / security info — separate from the login email so
  // changing it never breaks orders/transactions, which are keyed by the
  // original login email.
  recoveryEmail?: string;
  phone?: string;

  // Profile picture, stored as a data URL. Fine for small photos; if you
  // later add real file uploads, swap this for a hosted image URL instead.
  avatarUrl?: string;
}

// A pending password-reset code, stored separately from the user record.
interface PasswordResetRequest {
  email: string;
  code: string;
  expiresAt: number; // epoch ms
}


interface AuthContextType {
  currentUser: User | null;
  registerUser: (newUser: Omit<User, 'b9chich'> & { password: string }) => { success: boolean; error?: string };
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  logoutUser: () => void;
  addB9chich: (clientEmail: string, dinarAmount: number) => { success: boolean; message: string };
  spendB9chich: (dinarAmount: number) => { success: boolean; message: string };

  // Profile / security
  updateProfile: (updates: { username?: string; avatarUrl?: string }) => { success: boolean; message: string };
  updateSecurityInfo: (updates: { recoveryEmail?: string; phone?: string }) => { success: boolean; message: string };
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };

  // Forgot password
  requestPasswordResetCode: (email: string) => Promise<{ success: boolean; message: string; devCode?: string }>;
  verifyPasswordResetCode: (email: string, code: string) => { success: boolean; message: string };
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load active user session on startup
    const savedSession = localStorage.getItem('currentUser');
    if (savedSession) {
      try {
        const parsedUser = JSON.parse(savedSession);
        if (parsedUser.b9chich === undefined) parsedUser.b9chich = 0;
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
  }, []);

  const registerUser = (newUser: Omit<User, 'b9chich'> & { password: string }) => {
    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');

    const exists = existingUsers.some((u: any) => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'An account with this email already exists!' };
    }

    // Guarantee every account gets a referral code, even if the register
    // form didn't send one — this is what was showing as "------" before.
    const referralCode =
      newUser.referralCode ||
      `${newUser.username.replace(/\s+/g, '').slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const userToSave = { ...newUser, referralCode, b9chich: 0 };
    existingUsers.push(userToSave);
    localStorage.setItem('mario_users', JSON.stringify(existingUsers));

    // Carry every field from the saved account into the session (minus the
    // password) instead of a hand-picked whitelist — this is what was
    // silently dropping referralCode, wallet, totalReferralEarnings, etc.
    const { password: _password, ...sessionData } = userToSave;
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    setCurrentUser(sessionData);

    return { success: true };
  };

  const loginUser = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');

    // Check Shop Admin Account
    if (cleanEmail === "mariosshop@fgmail.com" && password === "marionsh") {
      const adminInDb = existingUsers.find((u: any) => u.email.toLowerCase() === cleanEmail);
      
      const adminSession: User = {
        username: "Shop Admin",
        email: "mariosshop@fgmail.com",
        isAdmin: true,
        b9chich: adminInDb ? (adminInDb.b9chich ?? 99999) : 99999,

        referralCode: "ADMIN",
        referredBy: null,

        wallet: 0,
        totalReferralEarnings: 0,
        firstPurchaseCompleted: true
      };
      localStorage.setItem('currentUser', JSON.stringify(adminSession));
      setCurrentUser(adminSession);
      return { success: true };
    }

    // Check Client Account
    const matchedUser = existingUsers.find(
      (u: any) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (matchedUser) {
      // Self-healing: accounts created before this fix have no referralCode
      // at all in storage. Generate one now and persist it, instead of
      // requiring the person to re-register.
      if (!matchedUser.referralCode) {
        matchedUser.referralCode = `${(matchedUser.username || 'USER').replace(/\s+/g, '').slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const healedUsers = existingUsers.map((u: any) =>
          u.email.toLowerCase() === cleanEmail ? { ...u, referralCode: matchedUser.referralCode } : u
        );
        localStorage.setItem('mario_users', JSON.stringify(healedUsers));
      }

      // Same fix as registerUser: carry the full stored record into the
      // session instead of just username/email/dob/isAdmin/b9chich.
      const { password: _password, ...sessionData } = matchedUser;
      if (sessionData.b9chich === undefined) sessionData.b9chich = 0;
      localStorage.setItem('currentUser', JSON.stringify(sessionData));
      setCurrentUser(sessionData);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const logoutUser = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // 1. ADMIN INJECT B9CHICH BY EMAIL
  const addB9chich = (clientEmail: string, dinarAmount: number) => {
    const cleanEmail = clientEmail.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
    
    let clientFound = false;

    const updatedUsers = existingUsers.map((user: any) => {
      if (user.email.toLowerCase() === cleanEmail) {
        clientFound = true;
        const currentBalance = Number(user.b9chich || 0);
        const addedAmount = Number(dinarAmount);
        return { ...user, b9chich: currentBalance + addedAmount };
      }
      return user;
    });

    if (!clientFound) {
      return { 
        success: false, 
        message: `❌ Error: No registered client found with email: ${clientEmail}` 
      };
    }

    // Write updated users array to database
    localStorage.setItem('mario_users', JSON.stringify(updatedUsers));

    const newBalance = updatedUsers.find((u: any) => u.email.toLowerCase() === cleanEmail)?.b9chich ?? 0;
    logTransaction({
      email: cleanEmail,
      type: 'Injection',
      amount: Number(dinarAmount),
      balanceAfter: newBalance,
      note: 'Admin balance top-up',
    });

    // Update session state instantly if target is active session
    if (currentUser && currentUser.email.toLowerCase() === cleanEmail) {
      const updatedSession = { 
        ...currentUser, 
        b9chich: Number(currentUser.b9chich || 0) + Number(dinarAmount) 
      };
      setCurrentUser(updatedSession);
      localStorage.setItem('currentUser', JSON.stringify(updatedSession));
    }

    return { 
      success: true, 
      message: `🎉 Success! Added ${dinarAmount} TND (${dinarAmount} B9CHICH) to ${clientEmail}` 
    };
  };

  // 2. REAL SPEND B9CHICH SYSTEM
  const spendB9chich = (dinarAmount: number) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to make a purchase.' };
    }

    const price = Number(dinarAmount);
    if (currentUser.b9chich < price) {
      return { 
        success: false, 
        message: `Insufficient B9CHICH! You have ${currentUser.b9chich} B9CHICH (${currentUser.b9chich} TND), but need ${price} B9CHICH.` 
      };
    }

    const newBalance = currentUser.b9chich - price;
    const updatedSession = { ...currentUser, b9chich: newBalance };
    setCurrentUser(updatedSession);
    localStorage.setItem('currentUser', JSON.stringify(updatedSession));

    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
    const updatedUsers = existingUsers.map((u: any) => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return { ...u, b9chich: newBalance };
      }
      return u;
    });
    localStorage.setItem('mario_users', JSON.stringify(updatedUsers));

    logTransaction({
      email: currentUser.email,
      type: 'Purchase',
      amount: price,
      balanceAfter: newBalance,
      note: 'Shop checkout',
    });

    return { 
      success: true, 
      message: `Purchase successful! Spent ${price} B9CHICH (${price} TND). Remaining balance: ${newBalance} B9CHICH.` 
    };
  };

  // 3a. UPDATE PROFILE (display name) — separate from updateSecurityInfo so
  // the "Full Name" field on the Profile tab actually persists; previously
  // there was no function that saved it at all, so it reset on refresh.
  const updateProfile = (updates: { username?: string; avatarUrl?: string }) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }

    const updatedSession = { ...currentUser, ...updates };
    setCurrentUser(updatedSession);
    localStorage.setItem('currentUser', JSON.stringify(updatedSession));

    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
    const updatedUsers = existingUsers.map((u: any) =>
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, ...updates } : u
    );
    localStorage.setItem('mario_users', JSON.stringify(updatedUsers));

    return { success: true, message: 'Profile updated.' };
  };

  // 3. UPDATE SECURITY INFO (recovery email / phone) — does NOT touch the
  // login email, so orders/transactions (keyed by login email) stay intact.
  const updateSecurityInfo = (updates: { recoveryEmail?: string; phone?: string }) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }

    const updatedSession = { ...currentUser, ...updates };
    setCurrentUser(updatedSession);
    localStorage.setItem('currentUser', JSON.stringify(updatedSession));

    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
    const updatedUsers = existingUsers.map((u: any) =>
      u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, ...updates } : u
    );
    localStorage.setItem('mario_users', JSON.stringify(updatedUsers));

    return { success: true, message: 'Security info updated.' };
  };

  // 4. CHANGE PASSWORD (requires current password)
  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
    const cleanEmail = currentUser.email.toLowerCase();
    const storedUser = existingUsers.find((u: any) => u.email.toLowerCase() === cleanEmail);

    if (!storedUser || storedUser.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    const updatedUsers = existingUsers.map((u: any) =>
      u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u
    );
    localStorage.setItem('mario_users', JSON.stringify(updatedUsers));

    return { success: true, message: 'Password changed successfully.' };
  };

  // 5. FORGOT PASSWORD — step 1: generate & email a 6-digit code.
  //
  // The code is stored locally (same as before) but now also sent for
  // real via /api/send-reset-email (which talks to Resend server-side).
  // If that send fails for any reason, we still hand back devCode so the
  // flow doesn't dead-end — the UI shows it on-screen as a fallback.
  const RESET_STORAGE_KEY = 'mario_password_resets';

  const requestPasswordResetCode = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
    const userExists = existingUsers.some((u: any) => u.email.toLowerCase() === cleanEmail);

    if (!userExists) {
      return { success: false, message: 'No account found with that email.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const request: PasswordResetRequest = {
      email: cleanEmail,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    const allRequests: PasswordResetRequest[] = JSON.parse(localStorage.getItem(RESET_STORAGE_KEY) || '[]');
    const filtered = allRequests.filter((r) => r.email !== cleanEmail);
    filtered.push(request);
    localStorage.setItem(RESET_STORAGE_KEY, JSON.stringify(filtered));

    try {
      const res = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code }),
      });
      if (!res.ok) throw new Error('send failed');
      return { success: true, message: 'Check your email for the code.' };
    } catch {
      // Email service unreachable/misconfigured — fall back to on-screen
      // code so testing still works instead of hard-failing.
      return { success: true, message: 'Reset code generated (email could not be sent).', devCode: code };
    }
  };

  // 6. FORGOT PASSWORD — step 2: verify the code the user typed in.
  const verifyPasswordResetCode = (email: string, code: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const allRequests: PasswordResetRequest[] = JSON.parse(localStorage.getItem(RESET_STORAGE_KEY) || '[]');
    const request = allRequests.find((r) => r.email === cleanEmail);

    if (!request) {
      return { success: false, message: 'No reset request found. Please request a new code.' };
    }
    if (Date.now() > request.expiresAt) {
      return { success: false, message: 'This code has expired. Please request a new one.' };
    }
    if (request.code !== code.trim()) {
      return { success: false, message: 'Incorrect code.' };
    }

    return { success: true, message: 'Code verified.' };
  };

  // 7. FORGOT PASSWORD — step 3: set the new password (re-checks the code
  // one more time so this can't be called without a valid verification).
  const resetPasswordWithCode = (email: string, code: string, newPassword: string) => {
    const verification = verifyPasswordResetCode(email, code);
    if (!verification.success) return verification;

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUsers = JSON.parse(localStorage.getItem('mario_users') || '[]');
    const updatedUsers = existingUsers.map((u: any) =>
      u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u
    );
    localStorage.setItem('mario_users', JSON.stringify(updatedUsers));

    // Clear the used reset request so the code can't be reused.
    const allRequests: PasswordResetRequest[] = JSON.parse(localStorage.getItem(RESET_STORAGE_KEY) || '[]');
    localStorage.setItem(RESET_STORAGE_KEY, JSON.stringify(allRequests.filter((r) => r.email !== cleanEmail)));

    return { success: true, message: 'Password reset successfully. You can now log in.' };
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      registerUser, 
      loginUser, 
      logoutUser, 
      addB9chich, 
      spendB9chich,
      updateProfile,
      updateSecurityInfo,
      changePassword,
      requestPasswordResetCode,
      verifyPasswordResetCode,
      resetPasswordWithCode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
