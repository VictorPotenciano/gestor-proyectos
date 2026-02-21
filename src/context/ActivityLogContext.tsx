// context/ActivityLogContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { getActivityLogs } from "@/lib/logapi";
import { ActivityLog } from "../../typing";

interface ActivityLogContextType {
  logs: ActivityLog[];
  loadingLogs: boolean;
  refreshLogs: () => Promise<void>;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(
  undefined
);

export const ActivityLogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const refreshLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await getActivityLogs();
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  return (
    <ActivityLogContext.Provider value={{ logs, loadingLogs, refreshLogs }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLogs = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error("useActivityLogs must be used within ActivityLogProvider");
  }
  return context;
};
