import { track } from '@vercel/analytics';

/**
 * Tracks a custom event using Vercel Analytics.
 * Protects against sending sensitive data by filtering properties.
 *
 * @param {string} eventName - The name of the event to track.
 * @param {object} properties - Optional properties to send with the event.
 */
export const trackEvent = (eventName, properties = {}) => {
  try {
    // Sanitize properties to prevent accidental tracking of sensitive info
    const sanitizedProps = { ...properties };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'email', 'phone'];
    
    Object.keys(sanitizedProps).forEach(key => {
      if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
        delete sanitizedProps[key];
      }
    });

    track(eventName, sanitizedProps);
    
    // In development mode, log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Tracked] ${eventName}`, sanitizedProps);
    }
  } catch (error) {
    console.warn(`Failed to track event: ${eventName}`, error);
  }
};

/**
 * Logs an error safely without exposing raw payloads or sensitive information to the user.
 * 
 * @param {string} context - The context where the error occurred (e.g., 'API Request', 'QR Scan')
 * @param {Error|object} error - The error object.
 */
export const logError = (context, error) => {
  try {
    const errorDetails = {
      context,
      message: error?.message || error?.toString() || 'Unknown error',
      status: error?.response?.status || error?.status || null,
      name: error?.name || 'Error'
    };

    // Track the error occurrence in Vercel Analytics as a generic event
    track('Error Encountered', {
      context: errorDetails.context,
      type: errorDetails.name,
      status: errorDetails.status ? String(errorDetails.status) : 'none'
    });

    // Always log full (safe) details to the console for developers
    console.error(`[Monitor Error] ${context}:`, errorDetails.message, error);
  } catch (err) {
    console.error('Failed to log error', err);
  }
};
