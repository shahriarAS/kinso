import { useCallback } from "react";
import toast from "react-hot-toast";

export const useNotification = () => {
  const success = useCallback(
    (title: string, message?: string) => {
      toast.success(message || title);
    },
    [],
  );

  const error = useCallback(
    (title: string, message?: string) => {
      toast.error(message || title);
    },
    [],
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      toast(message || title, {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#fff3cd",
          color: "#856404",
          border: "1px solid #ffeaa7",
        },
      });
    },
    [],
  );

  const info = useCallback(
    (title: string, message?: string) => {
      toast(message || title, {
        icon: "ℹ️",
        style: {
          borderRadius: "10px",
          background: "#d1ecf1",
          color: "#0c5460",
          border: "1px solid #bee5eb",
        },
      });
    },
    [],
  );

  return {
    success,
    error,
    warning,
    info,
  };
};
