// HIPAA-compliant session timeout management
// Automatically logs out users after inactivity to protect PHI

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_DURATION = 5 * 60 * 1000; // 5 minutes before timeout

let timeoutId: NodeJS.Timeout | null = null;
let warningTimeoutId: NodeJS.Timeout | null = null;

export interface SessionTimeoutCallbacks {
  onWarning: () => void;
  onTimeout: () => void;
}

export class SessionTimeoutManager {
  private callbacks: SessionTimeoutCallbacks;
  private isActive = false;

  constructor(callbacks: SessionTimeoutCallbacks) {
    this.callbacks = callbacks;
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.resetTimer();
    this.addEventListeners();
  }

  stop() {
    this.isActive = false;
    this.clearTimers();
    this.removeEventListeners();
  }

  resetTimer() {
    this.clearTimers();

    // Set warning timer (25 minutes)
    warningTimeoutId = setTimeout(() => {
      if (this.isActive) {
        this.callbacks.onWarning();
      }
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Set timeout timer (30 minutes)
    timeoutId = setTimeout(() => {
      if (this.isActive) {
        this.callbacks.onTimeout();
        this.stop();
      }
    }, TIMEOUT_DURATION);
  }

  private clearTimers() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (warningTimeoutId) {
      clearTimeout(warningTimeoutId);
      warningTimeoutId = null;
    }
  }

  private handleActivity = () => {
    if (this.isActive) {
      this.resetTimer();
    }
  };

  private addEventListeners() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  private removeEventListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity);
    });
  }
}