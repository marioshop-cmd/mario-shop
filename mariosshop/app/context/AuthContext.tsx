'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logTransaction } from '../lib/transactions';
import { requestAuthCode, verifyAuthCode } from '../lib/authCodes';

export interface User {
  username: string;
  email: string;
  dob?: string;
  isAdmin?: boolean;
  b9chich: number;

  country?: string;
  region?: string | null;

  referralCode?: string;
  referredBy?: string | null;

  wallet?: number;
  totalReferralEarnings?: number;
  firstPurchaseCompleted?: boolean;

  phone?: string;
  recoveryEmail?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: User | null;
  registerUser: (newUser: Omit<User, 'b9chich'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  // loginUser only checks the email/password — it does NOT log anyone in.
  // On success it returns the matched account; the caller must then get the
  // 2FA code verified and call completeLogin() to actually start the
  // session. This split is what makes 2FA possible: nothing about "being
  // logged in" happens until the code is confirmed.
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  completeLogin: (user: User) => void;
  logoutUser: () => void;
  requestPasswordResetCode: (email: string) => Promise<{ success: boolean; message: string; devCode?: string }>;
  verifyPasswordResetCode: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  addB9chich: (clientEmail: string, dinarAmount: number) => Promise<{ success: boolean; message: string }>;
  removeB9chich: (clientEmail: string, dinarAmount: number) => Promise<{ success: boolean; message: string }>;
  spendB9chich: (dinarAmount: number) => Promise<{ success: boolean; message: string }>;
  // Profile edits. They update the session instantly (so the UI reacts
  // right away) and save to the shared account directory in the background.
  updateProfile: (changes: { username?: string; avatarUrl?: string }) => { success: boolean; message: string };
  updateSecurityInfo: (changes: { recoveryEmail?: string; phone?: string }) => { success: boolean; message: string };
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*  Shared account directory — every registered user, persisted in Supabase   */
/*  instead of localStorage, so an admin (or anyone) sees the same account    */
/*  list no matter which browser/device they're on. This was the cause of    */
/*  "No registered client found" errors: the admin's own browser had never   */
/*  seen an account that was created somewhere else.                        */
/* -------------------------------------------------------------------------- */

async function readAccounts(): Promise<any[]> {
  const response = await fetch('/api/user-accounts', { cache: 'no-store' });
  const parsed: unknown = await response.json();
  if (!response.ok) {
    const details =
      parsed && typeof parsed === 'object' && 'details' in parsed
        ? String((parsed as { details: unknown }).details)
        : 'Unknown server error';
    throw new Error(`Unable to load accounts: ${details}`);
  }
  return Array.isArray(parsed) ? parsed : [];
}

async function writeAccounts(users: any[]): Promise<boolean> {
  const response = await fetch('/api/user-accounts', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(users),
  });
  return response.ok;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load active user session on startup — this stays in localStorage on
    // purpose: it's just "who is logged in on this browser right now", not
    // the shared account directory.
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

  const registerUser = async (newUser: Omit<User, 'b9chich'> & { password: string }) => {
    const existingUsers = await readAccounts();

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
    const saved = await writeAccounts(existingUsers);
    if (!saved) {
      return { success: false, error: 'Something went wrong creating your account. Please try again.' };
    }

    // Carry every field from the saved account into the session (minus the
    // password) instead of a hand-picked whitelist — this is what was
    // silently dropping referralCode, wallet, totalReferralEarnings, etc.
    const { password: _password, ...sessionData } = userToSave;
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    setCurrentUser(sessionData);

    return { success: true };
  };

  const loginUser = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existingUsers = await readAccounts();

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
      // No session is started here — the caller still needs to get the
      // 2FA code verified and call completeLogin(adminSession).
      return { success: true, user: adminSession };
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
        await writeAccounts(healedUsers);
      }

      // Same fix as registerUser: carry the full stored record into the
      // session instead of just username/email/dob/isAdmin/b9chich.
      const { password: _password, ...sessionData } = matchedUser;
      if (sessionData.b9chich === undefined) sessionData.b9chich = 0;
      // Credentials are correct, but the session does NOT start yet — the
      // caller still needs the 2FA code verified first.
      return { success: true, user: sessionData as User };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  // Actually starts the session. Only call this after the 2FA code has
  // been verified — this is the one place `currentUser`/localStorage gets
  // set for a fresh login (registerUser still logs in immediately, since
  // account creation itself is the trusted action there).
  const completeLogin = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logoutUser = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // FORGOT PASSWORD FLOW — same auth_codes system as register/login 2FA,
  // just with purpose 'reset'.
  const requestPasswordResetCode = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existingUsers = await readAccounts();
    const exists = existingUsers.some((u: any) => u.email.toLowerCase() === cleanEmail);
    if (!exists) {
      return { success: false, message: 'No account found with that email.' };
    }

    const result = await requestAuthCode(cleanEmail, 'reset');
    if (!result.success) {
      return { success: false, message: result.message || 'Could not send the reset code. Please try again.' };
    }
    return { success: true, message: 'Code sent.', devCode: result.devCode };
  };

  // Single-use: a successful verify consumes the code server-side. The
  // actual password change below trusts that this step already happened
  // (it doesn't re-verify), so step 3 doesn't get blocked by its own code
  // already being spent here.
  const verifyPasswordResetCode = async (email: string, code: string) => {
    const result = await verifyAuthCode(email.trim().toLowerCase(), code.trim(), 'reset');
    return result.success
      ? { success: true, message: '' }
      : { success: false, message: result.message || 'Incorrect code.' };
  };

  const resetPasswordWithCode = async (email: string, _code: string, newPassword: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existingUsers = await readAccounts();
    const idx = existingUsers.findIndex((u: any) => u.email.toLowerCase() === cleanEmail);
    if (idx === -1) {
      return { success: false, message: 'No account found with that email.' };
    }

    existingUsers[idx] = { ...existingUsers[idx], password: newPassword };
    const saved = await writeAccounts(existingUsers);
    if (!saved) {
      return { success: false, message: 'Something went wrong saving your new password. Please try again.' };
    }
    return { success: true, message: 'Password reset successfully.' };
  };

  // Shared helper for both addB9chich and removeB9chich — same lookup,
  // same session sync, only the sign of the change differs.
  const adjustB9chich = async (clientEmail: string, dinarAmount: number, direction: 1 | -1) => {
    const cleanEmail = clientEmail.trim().toLowerCase();
    const existingUsers = await readAccounts();

    let clientFound = false;
    let newBalance = 0;

    const updatedUsers = existingUsers.map((user: any) => {
      if (user.email.toLowerCase() === cleanEmail) {
        clientFound = true;
        const currentBalance = Number(user.b9chich || 0);
        const delta = Number(dinarAmount) * direction;
        // Never let a deduction push a balance below 0.
        newBalance = Math.max(0, currentBalance + delta);
        return { ...user, b9chich: newBalance };
      }
      return user;
    });

    if (!clientFound) {
      return {
        success: false,
        message: `❌ Error: No registered client found with email: ${clientEmail}`,
      };
    }

    const saved = await writeAccounts(updatedUsers);
    if (!saved) {
      return { success: false, message: '❌ Error: Something went wrong saving the balance change. Please try again.' };
    }

    logTransaction({
      email: cleanEmail,
      type: direction === 1 ? 'Injection' : 'Deduction',
      amount: Number(dinarAmount),
      balanceAfter: newBalance,
      note: direction === 1 ? 'Admin balance top-up' : 'Admin balance deduction',
    });

    // Update session state instantly if target is the active session.
    if (currentUser && currentUser.email.toLowerCase() === cleanEmail) {
      const updatedSession = { ...currentUser, b9chich: newBalance };
      setCurrentUser(updatedSession);
      localStorage.setItem('currentUser', JSON.stringify(updatedSession));
    }

    return {
      success: true,
      message:
        direction === 1
          ? `🎉 Success! Added ${dinarAmount} TND (${dinarAmount} B9CHICH) to ${clientEmail}`
          : `✅ Removed ${dinarAmount} B9CHICH from ${clientEmail}. New balance: ${newBalance} B9CHICH`,
    };
  };

  // ADMIN: ADD B9CHICH BY EMAIL
  const addB9chich = (clientEmail: string, dinarAmount: number) => adjustB9chich(clientEmail, dinarAmount, 1);

  // ADMIN: REMOVE B9CHICH BY EMAIL — clamped so a balance never goes negative.
  const removeB9chich = (clientEmail: string, dinarAmount: number) => adjustB9chich(clientEmail, dinarAmount, -1);

  // REAL SPEND B9CHICH SYSTEM
  const spendB9chich = async (dinarAmount: number) => {
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

    const existingUsers = await readAccounts();
    const updatedUsers = existingUsers.map((u: any) => {
      if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return { ...u, b9chich: newBalance };
      }
      return u;
    });
    await writeAccounts(updatedUsers);

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

  // Shared helper for updateProfile / updateSecurityInfo.
  const applyProfileChanges = (changes: Partial<User>): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }

    // Drop undefined values so they never overwrite existing data.
    const cleanChanges: Partial<User> = {};
    (Object.keys(changes) as (keyof User)[]).forEach((key) => {
      if (changes[key] !== undefined) {
        (cleanChanges as any)[key] = changes[key];
      }
    });

    if (cleanChanges.username !== undefined && !cleanChanges.username.trim()) {
      return { success: false, message: 'Name cannot be empty.' };
    }

    const email = currentUser.email.toLowerCase();
    const updatedSession: User = { ...currentUser, ...cleanChanges };
    setCurrentUser(updatedSession);
    localStorage.setItem('currentUser', JSON.stringify(updatedSession));

    // Save to the shared directory without blocking the UI.
    (async () => {
      try {
        const existingUsers = await readAccounts();
        const updatedUsers = existingUsers.map((u: any) =>
          u.email.toLowerCase() === email ? { ...u, ...cleanChanges } : u
        );
        await writeAccounts(updatedUsers);
      } catch (e) {
        console.error('Failed to save profile changes', e);
      }
    })();

    return { success: true, message: 'Profile updated.' };
  };

  const updateProfile = (changes: { username?: string; avatarUrl?: string }) => applyProfileChanges(changes);

  const updateSecurityInfo = (changes: { recoveryEmail?: string; phone?: string }) => applyProfileChanges(changes);

  // Unlike updateProfile/updateSecurityInfo above, this can't be "fire and
  // forget" — it has to actually check the current password against the
  // shared account directory before allowing the change, so it's properly
  // async and the caller must await it.
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in.' };
    }
    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const email = currentUser.email.toLowerCase();
    const existingUsers = await readAccounts();
    const idx = existingUsers.findIndex((u: any) => u.email.toLowerCase() === email);

    if (idx === -1) {
      return { success: false, message: 'Account not found.' };
    }
    if (existingUsers[idx].password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    existingUsers[idx] = { ...existingUsers[idx], password: newPassword };
    const saved = await writeAccounts(existingUsers);
    if (!saved) {
      return { success: false, message: 'Something went wrong saving your new password. Please try again.' };
    }

    return { success: true, message: 'Password updated successfully.' };
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      registerUser,
      loginUser,
      completeLogin,
      logoutUser,
      requestPasswordResetCode,
      verifyPasswordResetCode,
      resetPasswordWithCode,
      addB9chich,
      removeB9chich,
      spendB9chich,
      updateProfile,
      updateSecurityInfo,
      changePassword
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
