/**
 * Copies exact raw text to the user's clipboard preserving all whitespace.
 * Returns true if the copy succeeded, false otherwise.
 * Never silently swallows failures or claims success on error.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof text !== 'string') {
    return false;
  }

  // 1. Modern Navigator Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission rejected or unsupported context; attempt fallback below
    }
  }

  // 2. Resilient fallback for older browsers or non-secure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Ensure element is off-screen but part of DOM so copy works
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
