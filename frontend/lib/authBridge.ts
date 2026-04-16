let logoutHandler: (() => void) | null = null;
let isTriggered = false;

export function setLogoutHandler(fn: () => void) {
  logoutHandler = fn;
  isTriggered = false;
}

export function triggerLogout() {
  if (logoutHandler && !isTriggered) {
    isTriggered = true;
    logoutHandler();
  }
}