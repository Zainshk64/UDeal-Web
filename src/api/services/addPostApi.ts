import { toast } from 'sonner';
import apiClient from './api';

export type ImageScanResult = {
  isSafe: boolean;
  reasons: string[];
};

const getVisionApiKey = (): string | undefined =>
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY
    : undefined;

const weaponKeywords = [
  'gun',
  'rifle',
  'pistol',
  'revolver',
  'handgun',
  'firearm',
  'shotgun',
  'sniper',
  'assault rifle',
  'machine gun',
  'knife',
  'dagger',
  'sword',
  'machete',
  'grenade',
  'bomb',
  'explosive',
  'dynamite',
  'landmine',
  'warhead',
];

const explicitKeywords = [
  'nude',
  'nudity',
  'naked',
  'lingerie',
  'erotic',
  'pornography',
  'explicit',
  'adult content',
  'explictit',
  'topless',
  'genitalia',
  'sex',
  'porn',
];

function fileToCompressedBase64(file: File, maxW = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxW) {
          height = (height * maxW) / width;
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        URL.revokeObjectURL(url);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load'));
    };
    img.src = url;
  });
}

/** Same semantics as mobile: SAFE_SEARCH + LABELS; keyword block on labels. */
export async function checkImagesSafe(files: File[]): Promise<ImageScanResult> {
  if (files.length === 0) return { isSafe: true, reasons: [] };

  const apiKey = getVisionApiKey();
  if (!apiKey) {
    return { isSafe: true, reasons: ['Vision API key missing'] };
  }

  const detectedReasons = new Set<string>();

  try {
    for (const file of files) {
      const base64 = await fileToCompressedBase64(file);

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [
                  { type: 'SAFE_SEARCH_DETECTION', maxResults: 1 },
                  { type: 'LABEL_DETECTION', maxResults: 20 },
                ],
              },
            ],
          }),
        }
      );

      if (response.status !== 200) continue;

      const json = await response.json();
      const resp = json.responses?.[0];
      if (!resp) continue;

      const safe = resp.safeSearchAnnotation;
      if (safe) {
        if (['LIKELY', 'VERY_LIKELY'].includes(safe.violence)) detectedReasons.add('violence');
        if (['LIKELY', 'VERY_LIKELY'].includes(safe.adult)) detectedReasons.add('adult');
        if (['LIKELY', 'VERY_LIKELY'].includes(safe.racy)) detectedReasons.add('racy');
      }

      const labels = resp.labelAnnotations || [];
      labels.forEach((l: { description?: string; score?: number }) => {
        if (l.description && l.score) {
          detectedReasons.add(l.description.toLowerCase());
        }
      });

      const descriptions = labels.map((l: { description: string }) =>
        l.description.toLowerCase()
      );

      const hasWeapon = weaponKeywords.some((kw) =>
        descriptions.some((d: string) => d.includes(kw))
      );
      const hasExplicit = explicitKeywords.some((kw) =>
        descriptions.some((d: string) => d.includes(kw))
      );

      if (hasWeapon || hasExplicit) {
        return { isSafe: false, reasons: Array.from(detectedReasons) };
      }
    }

    return { isSafe: true, reasons: [] };
  } catch {
    return { isSafe: true, reasons: ['vision_check_failed'] };
  }
}

export async function upsertProductCreate(
  categoryId: number,
  subCatId: number,
  userId: number,
  data: Record<string, unknown>
): Promise<number | null> {
  try {
    const payload = {
      productId: 0,
      categoryId,
      data: {
        CreatedByUid: userId,
        SubCatId: subCatId,
        CountryId: 1,
        ...data,
      },
    };
    const response = await apiClient.post('/products/upsert', payload);
    const d = response.data;
    const pid = d?.productId ?? d?.ProductId ?? d?.data?.productId;
    if (pid != null && pid !== '') {
      return Number(pid);
    }
    if (d?.success === false || d?.returnCode === false) {
      throw new Error(d?.message || d?.returnText || 'Upsert failed');
    }
    toast.error('Could not create ad', {
      description: d?.returnText || d?.message || 'No product id returned',
    });
    return null;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { returnText?: string } }; message?: string };
    toast.error('Failed to post ad', {
      description: err.response?.data?.returnText || err.message || 'Please try again',
    });
    return null;
  }
}
