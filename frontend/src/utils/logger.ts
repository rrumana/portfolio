const LOG_ENDPOINT = '/api/logs';
const CLIENT_COOKIE = 'portfolio_client_id';
const ONE_YEAR_SECONDS = 31_536_000;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = {
  component?: string;
  page?: string;
  context?: Record<string, unknown>;
  requestId?: string;
};

const isBrowser = typeof window !== 'undefined';
const isDev = typeof import.meta !== 'undefined' ? import.meta.env.DEV : false;

let cachedClientId: string | null = null;
let remoteLoggingFailed = false;
let globalHandlersInstalled = false;

function getCookie(name: string): string | null {
  if (!isBrowser) return null;
  return document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.split('=')[1] ?? null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser) return;
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function ensureClientId(): string {
  if (cachedClientId) return cachedClientId;

  const fromCookie = getCookie(CLIENT_COOKIE);
  if (fromCookie) {
    cachedClientId = fromCookie;
    return cachedClientId;
  }

  const generated = isBrowser && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  cachedClientId = generated;
  setCookie(CLIENT_COOKIE, generated, ONE_YEAR_SECONDS);
  return cachedClientId;
}

async function sendToBackend(level: LogLevel, message: string, ctx: LogContext = {}) {
  if (!isBrowser || remoteLoggingFailed) return;

  const clientId = ensureClientId();
  const payload = {
    level,
    message,
    component: ctx.component,
    page: ctx.page ?? window.location.pathname,
    request_id: ctx.requestId,
    client_id: clientId,
    context: ctx.context,
  };

  if (isDev) {
    // Always mirror to console in dev for easy visibility.
    const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleFn('[frontend]', level.toUpperCase(), message, ctx);
  }

  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && level !== 'debug') {
      const ok = navigator.sendBeacon(LOG_ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (ok) return;
    }

    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch (err) {
    // Avoid spamming the log endpoint if it is unavailable (e.g., during local Astro-only dev).
    remoteLoggingFailed = true;
    if (isDev) {
      console.warn('Remote logging disabled after failure:', err);
    }
  }
}

function normalizeLevel(level: string): LogLevel {
  const lowered = level.toLowerCase();
  if (lowered === 'warn' || lowered === 'warning') return 'warn';
  if (lowered === 'error') return 'error';
  if (lowered === 'debug') return 'debug';
  return 'info';
}

export function logInfo(message: string, ctx: LogContext = {}) {
  return sendToBackend('info', message, ctx);
}

export function logWarn(message: string, ctx: LogContext = {}) {
  return sendToBackend('warn', message, ctx);
}

export function logError(message: string, ctx: LogContext = {}) {
  return sendToBackend('error', message, ctx);
}

export function logDebug(message: string, ctx: LogContext = {}) {
  return sendToBackend('debug', message, ctx);
}

export function installGlobalErrorHandlers(component = 'frontend') {
  if (!isBrowser || globalHandlersInstalled) return;
  globalHandlersInstalled = true;

  window.addEventListener('error', (event) => {
    logError('Unhandled error', {
      component,
      context: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled rejection', {
      component,
      context: {
        reason: String(event.reason),
      },
    });
  });
}

export function makeWasmLogSink(component = 'wasm') {
  return (level: string, message: string) => {
    const normalized = normalizeLevel(level);
    sendToBackend(normalized, message, { component });
  };
}
