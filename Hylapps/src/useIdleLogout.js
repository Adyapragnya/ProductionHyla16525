// useIdleLogout.js
import { useEffect, useCallback, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import axios from "axios";
import { AuthContext } from "AuthContext";

/**
 * Default configuration constants
 */
const DEFAULT_TIMEOUT_MS = 10 * 60 * 60 * 1000; // 10 hours
const DEFAULT_EVENTS = [
  "mousemove",
  "mousedown",
  "keypress",
  "scroll",
  "touchstart",
  "wheel",
  "touchmove",
  "pointermove",
];

/**
 * Debounce hook: Returns a debounced version of a callback
 */
function useDebouncedCallback(callback, delay) {
  const timer = useRef(null);

  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

/**
 * Custom hook to logout user after inactivity
 * @param {Object} options
 * @param {number} options.timeoutMs - Idle timeout in ms
 * @param {string[]} options.activityEvents - List of DOM events to consider activity
 * @param {boolean} options.pauseOnVisibilityChange - Pause timer on blur/hidden
 * @param {string} options.alertTitle - Alert title
 * @param {string} options.alertText - Alert message
 * @param {"warning"|"info"|"error"|"success"} options.alertIcon - Alert icon
 */
function useIdleLogout(options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    activityEvents = DEFAULT_EVENTS,
    pauseOnVisibilityChange = true,
    alertTitle = "Session Ended",
    alertText = "Your session has ended. Please log in again.",
    alertIcon = "warning",
  } = options;

  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const idleTimer = useRef(null);
  const logoutCalled = useRef(false);
  const axiosCancelSource = useRef(null);

  /** Clear stored credentials */
  const clearSensitiveData = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("sessionId");
  }, []);

  /** Clear the idle timer */
  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  /** Perform logout with optional server notification */
  const logout = useCallback(async (reason = "Session expired") => {
    if (!isAuthenticated || logoutCalled.current) return;
    logoutCalled.current = true;
    clearIdleTimer();
    clearSensitiveData();

    // Cancel any ongoing request
    if (axiosCancelSource.current) {
      axiosCancelSource.current.cancel("Session ended");
    }

    try {
      axiosCancelSource.current = axios.CancelToken.source();
      await axios.post(
        "/api/logout",
        { reason },
        { cancelToken: axiosCancelSource.current.token }
      );
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Logout API error", err);
    }

    setIsAuthenticated(false);
    swal(alertTitle, alertText, alertIcon).then(() => {
      navigate("/sign-in", { replace: true });
    });
  }, [isAuthenticated, clearIdleTimer, clearSensitiveData, setIsAuthenticated, navigate, alertTitle, alertText, alertIcon]);

  /** Reset the idle timer */
  const resetIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => logout("User inactive"), timeoutMs);
  }, [clearIdleTimer, logout, timeoutMs]);

  const debouncedReset = useDebouncedCallback(resetIdleTimer, 300);

  /** Handler for any user activity */
  const handleActivity = useCallback(() => {
    debouncedReset();
  }, [debouncedReset]);

  /** Handler for visibility change (pause/resume timer) */
  const handleVisibility = useCallback(() => {
    if (document.hidden || !document.hasFocus()) {
      clearIdleTimer();
    } else {
      resetIdleTimer();
    }
  }, [clearIdleTimer, resetIdleTimer]);

  // Initialize or clear based on auth
  useEffect(() => {
    logoutCalled.current = false;
    if (isAuthenticated) resetIdleTimer();
    else clearIdleTimer();
  }, [isAuthenticated, resetIdleTimer, clearIdleTimer]);

  // Attach activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    activityEvents.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    if (pauseOnVisibilityChange) {
      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("focus", handleVisibility);
      window.addEventListener("blur", handleVisibility);
    }

    return () => {
      clearIdleTimer();
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("blur", handleVisibility);
    };
  }, [isAuthenticated, activityEvents, handleActivity, handleVisibility, clearIdleTimer, pauseOnVisibilityChange]);

  // Enforce single-device session
  useEffect(() => {
    const initialSessionId = localStorage.getItem("sessionId");
    const handleStorage = (e) => {
      if (e.key === "sessionId" && e.newValue !== initialSessionId) {
        logout("Another device logged in");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [logout]);
}

export default useIdleLogout;
