// ✅ Member Hook - Active Family Member Context
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MemberContext = createContext(null);

const STORAGE_KEY = "swasth_active_member";

/**
 * Active Member Object Structure:
 * {
 *   id: string,           // 'self' or member._id
 *   name: string,         // Display name
 *   memberId: string|null // null for self, member._id for family member
 * }
 */

export function MemberProvider({ children }) {
  const [activeMember, setActiveMemberState] = useState({
    id: "self",
    name: "Self",
    memberId: null,
  });
  const [loading, setLoading] = useState(true);

  // Restore active member from storage on mount
  useEffect(() => {
    restoreActiveMember();
  }, []);

  const restoreActiveMember = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setActiveMemberState(parsed);
      }
    } catch (e) {
      console.error("Error restoring active member:", e);
    } finally {
      setLoading(false);
    }
  };

  // Set active member and persist to storage
  const setActiveMember = async (member) => {
    try {
      const memberData = {
        id: member._id || member.id || "self",
        name: member.name || "Self",
        memberId: member._id || member.memberId || null,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memberData));
      setActiveMemberState(memberData);
    } catch (e) {
      console.error("Error setting active member:", e);
    }
  };

  // Switch to self (logged-in user)
  const switchToSelf = async (userName = "Self") => {
    try {
      const selfData = {
        id: "self",
        name: userName,
        memberId: null,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selfData));
      setActiveMemberState(selfData);
    } catch (e) {
      console.error("Error switching to self:", e);
    }
  };

  // Clear active member (on logout)
  const clearActiveMember = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setActiveMemberState({
        id: "self",
        name: "Self",
        memberId: null,
      });
    } catch (e) {
      console.error("Error clearing active member:", e);
    }
  };

  // Check if viewing a family member (not self)
  const isViewingFamily = activeMember.memberId !== null;

  return (
    <MemberContext.Provider
      value={{
        activeMember,
        setActiveMember,
        switchToSelf,
        clearActiveMember,
        isViewingFamily,
        loading,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export const useMember = () => {
  const ctx = useContext(MemberContext);
  if (!ctx) {
    throw new Error("useMember must be used within MemberProvider");
  }
  return ctx;
};
