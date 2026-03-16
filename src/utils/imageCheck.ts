const WEAPON_KEYWORDS = [
  'gun', 'rifle', 'pistol', 'revolver', 'handgun', 'firearm',
  'shotgun', 'sniper', 'assault rifle', 'machine gun', 'knife',
  'dagger', 'sword', 'machete', 'grenade', 'bomb', 'explosive',
];

const EXPLICIT_KEYWORDS = [
  'nude', 'nudity', 'naked', 'lingerie', 'erotic', 'pornography',
  'explicit', 'adult content', 'topless', 'genitalia', 'sex', 'porn',
];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export interface ImageScanResult {
  isSafe: boolean;
  reasons: string[];
}

export const checkImagesSafe = async (files: File[]): Promise<ImageScanResult> => {
  if (files.length === 0) return { isSafe: true, reasons: [] };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    console.warn('Vision API key missing, skipping safety check');
    return { isSafe: true, reasons: ['vision_key_missing'] };
  }

  const detectedReasons = new Set<string>();

  try {
    for (const file of files) {
      const base64 = await fileToBase64(file);

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: base64 },
              features: [
                { type: 'SAFE_SEARCH_DETECTION', maxResults: 1 },
                { type: 'LABEL_DETECTION', maxResults: 20 },
              ],
            }],
          }),
        }
      );

      if (response.status !== 200) continue;

      const json = await response.json();
      const resp = json.responses?.[0];
      if (!resp) continue;

      // Safe Search
      const safe = resp.safeSearchAnnotation;
      if (safe) {
        if (['LIKELY', 'VERY_LIKELY'].includes(safe.violence)) detectedReasons.add('violence');
        if (['LIKELY', 'VERY_LIKELY'].includes(safe.adult)) detectedReasons.add('adult');
        if (['LIKELY', 'VERY_LIKELY'].includes(safe.racy)) detectedReasons.add('racy');
      }

      // Labels
      const labels = resp.labelAnnotations || [];
      const descriptions = labels.map((l: any) => l.description.toLowerCase());

      const hasWeapon = WEAPON_KEYWORDS.some((kw) => descriptions.some((d: string) => d.includes(kw)));
      const hasExplicit = EXPLICIT_KEYWORDS.some((kw) => descriptions.some((d: string) => d.includes(kw)));

      if (hasWeapon || hasExplicit) {
        return { isSafe: false, reasons: Array.from(detectedReasons) };
      }
    }

    return { isSafe: true, reasons: [] };
  } catch (e) {
    console.error('Vision API error:', e);
    return { isSafe: true, reasons: ['vision_check_failed'] };
  }
};