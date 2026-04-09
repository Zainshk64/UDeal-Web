"use client";

import Link from "next/link";
import Image from "next/image";
import { AppAd, getAdImageUrl } from "@/src/api/services/AppAdsApi";

type AppAdBannerProps = {
  ad: AppAd | null | undefined;
  className?: string;
  size?: "standard" | "compact";
};

export default function AppAdBanner({
  ad,
  className = "",
  size = "standard",
}: AppAdBannerProps) {
  if (!ad) return null;

  const imageUrl = getAdImageUrl(ad.AdImage);
  if (!imageUrl) return null;

  const imageHeightClass =
    size === "compact"
      ? "h-[110px] sm:h-[130px] md:h-[150px]"
      : "h-[140px] sm:h-[170px] md:h-[190px] lg:h-[210px]";

  return (
    <div className={className}>
      <Link
        href={ad.AdLink || "#"}
        target={ad.AdLink ? "_blank" : "_self"}
        rel={ad.AdLink ? "noopener noreferrer" : undefined}
        className="block overflow-hidden rounded-xl shado-sm transition how-md"
      >
        <Image
          src={imageUrl}
          alt={ad.AdTitle || "Advertisement"}
          width={1280}
          height={320}
          className={`w-full h-full ${imageHeightClass} object-contain`}
        />
      </Link>
    </div>
  );
}
