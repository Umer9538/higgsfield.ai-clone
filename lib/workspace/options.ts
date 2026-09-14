/** Alternatives offered when a control is cycled or opened. */
const CHOICES: Record<string, string[]> = {
  Model: ["Seedance 2.5", "Kling 3.0", "Sora 2", "Google Veo 3.1", "Wan 3.0"],
  Quality: ["480p", "720p", "1080p", "4K"],
  Bitrate: ["Low", "Medium", "High"],
  Duration: ["5s", "8s", "10s", "15s"],
};

const PILL_CYCLES: Record<string, string[]> = {
  "5s": ["5s", "8s", "10s", "15s"],
  "16:9": ["16:9", "9:16", "1:1", "4:3"],
  "9:16": ["9:16", "16:9", "1:1", "4:3"],
  "3:4": ["3:4", "1:1", "9:16", "16:9"],
  "2K": ["2K", "4K", "1080p"],
  "1080p": ["1080p", "720p", "4K"],
  "720p": ["720p", "1080p", "4K"],
  High: ["High", "Medium", "Low"],
  On: ["On", "Off"],
  Auto: ["Auto", "Manual"],
  Closeup: ["Closeup", "Wide", "Medium", "Macro"],
};

export function choicesFor(label: string, current: string): string[] {
  return CHOICES[label] ?? [current];
}

/** Next value when a pill is clicked; falls back to itself when there is no cycle. */
export function nextPillValue(current: string): string {
  const cycle = PILL_CYCLES[current];
  if (!cycle) return current;
  return cycle[(cycle.indexOf(current) + 1) % cycle.length];
}

/** Choices offered by the Cinema Studio setup tiles. */
export const SETUP_OPTIONS: Record<string, string[]> = {
  "Film setup": ["Auto", "Cinematic", "Documentary", "Music video", "Commercial"],
  Camera: ["Auto", "35mm", "50mm", "85mm", "Anamorphic"],
  "Color palette": ["Auto", "Warm Vintage", "Orange Teal", "Monochrome", "Pastel"],
  Lighting: ["Auto", "Studio Soft Light", "Golden Hour", "Neon Night", "High Key"],
};
