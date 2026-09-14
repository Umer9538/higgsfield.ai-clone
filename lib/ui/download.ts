/**
 * Triggers a real file download for a mirrored asset in public/media.
 * Falls back to opening the asset if the blob fetch is blocked.
 */
export async function downloadAsset(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    window.open(url, "_blank", "noopener");
    return false;
  }
}
