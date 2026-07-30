import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE } from '../config/constants';
import { hashValue, verifyValue } from '../utils/crypto';
import { validateRegistration, validateNewPassword } from '../utils/authValidation';

const AuthContext = createContext(null);

// Accounts stored locally on this device: [{ id, username, passwordHash,
// passwordSalt, securityQuestion, securityAnswerHash, securityAnswerSalt, createdAt }]
// Session stores only the id of whoever is currently logged in — `null`
// (or missing) always means "Guest", the default state that requires no
// login at all.

const normalizeUsername = (username) => (username || '').trim();

const useAuthState = () => {
  const [accounts, setAccounts] = useLocalStorage(STORAGE.keys.accounts, () => []);
  const [session, setSession] = useLocalStorage(STORAGE.keys.session, () => ({
    accountId: null,
  }));

  const currentAccount = useMemo(
    () => accounts.find((a) => a.id === session.accountId) || null,
    [accounts, session.accountId]
  );

  const isGuest = !currentAccount;

  const findByUsername = useCallback(
    (username) => {
      const normalized = normalizeUsername(username).toLowerCase();
      return accounts.find((a) => a.username.toLowerCase() === normalized) || null;
    },
    [accounts]
  );

  // Create a new local account. Returns { success, error? }.
  const register = useCallback(
    async ({ username, password, securityQuestion, securityAnswer }) => {
      const validation = validateRegistration({
        username,
        password,
        securityQuestion,
        securityAnswer,
        usernameTaken: Boolean(findByUsername(normalizeUsername(username))),
      });
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      const cleanUsername = validation.cleanUsername;

      const { hash: passwordHash, salt: passwordSalt } = await hashValue(password);
      const { hash: securityAnswerHash, salt: securityAnswerSalt } = await hashValue(
        securityAnswer.trim().toLowerCase()
      );

      const newAccount = {
        id: uuidv4(),
        username: cleanUsername,
        passwordHash,
        passwordSalt,
        securityQuestion,
        securityAnswerHash,
        securityAnswerSalt,
        createdAt: Date.now(),
      };

      setAccounts((prev) => [...prev, newAccount]);
      setSession({ accountId: newAccount.id });

      return { success: true };
    },
    [findByUsername, setAccounts, setSession]
  );

  // Log in to an existing local account. Returns { success, error? }.
  const login = useCallback(
    async ({ username, password }) => {
      const account = findByUsername(username);
      if (!account) {
        return { success: false, error: 'ไม่พบชื่อผู้ใช้นี้' };
      }

      const valid = await verifyValue(password, account.passwordHash, account.passwordSalt);
      if (!valid) {
        return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
      }

      setSession({ accountId: account.id });
      return { success: true };
    },
    [findByUsername, setSession]
  );

  // Log out back to Guest mode. Local data (novels, history, etc.) is
  // never touched or deleted by this — only the "who's logged in" flag.
  const logout = useCallback(() => {
    setSession({ accountId: null });
  }, [setSession]);

  // Step 1 of "forgot password": look up the account's security question
  // without revealing whether a matching password exists.
  const getSecurityQuestion = useCallback(
    (username) => {
      const account = findByUsername(username);
      return account ? account.securityQuestion : null;
    },
    [findByUsername]
  );

  // Step 2 of "forgot password": verify the answer and set a new password.
  // Returns { success, error? }.
  const resetPassword = useCallback(
    async ({ username, securityAnswer, newPassword }) => {
      const account = findByUsername(username);
      if (!account) {
        return { success: false, error: 'ไม่พบชื่อผู้ใช้นี้' };
      }
      const validation = validateNewPassword(newPassword);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const answerValid = await verifyValue(
        (securityAnswer || '').trim().toLowerCase(),
        account.securityAnswerHash,
        account.securityAnswerSalt
      );
      if (!answerValid) {
        return { success: false, error: 'คำตอบไม่ถูกต้อง' };
      }

      const { hash: passwordHash, salt: passwordSalt } = await hashValue(newPassword);
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, passwordHash, passwordSalt } : a))
      );

      return { success: true };
    },
    [findByUsername, setAccounts]
  );

  return {
    currentAccount,
    isGuest,
    register,
    login,
    logout,
    getSecurityQuestion,
    resetPassword,
  };
};

export const AuthProvider = ({ children }) => {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthStore = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthStore must be used within an <AuthProvider>');
  }
  return ctx;
};

export default useAuthStore;
