// components/HeroBanner.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HeroBannerProps {
  /** Path to a local image in /public, e.g. "/images/farmer-hero.jpg" */
  imageSrc: string;
  variant: "farmer" | "vendor";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/**
 * Photo-backed hero banner used on both the farmer and vendor views —
 * deliberately styled differently per variant so the two roles feel visually
 * distinct rather than reusing one template with a different photo dropped in:
 *
 *  - farmer: taller, warm bottom-up scrim, amber glow, content anchored low
 *    (mirrors "golden hour in the field" — this is the primary CTA surface)
 *  - vendor: shorter, cooler diagonal scrim, emerald glow, content centered
 *    (mirrors "fresh market morning" — this sits above a data-dense feed,
 *    so it stays compact rather than competing for space)
 *
 * The background is set as two stacked CSS background-image layers — a flat
 * tint color plus the photo url() — so if the photo file hasn't been added
 * to /public yet, the tint alone still renders as an intentional-looking
 * color block instead of a broken image icon.
 */
export default function HeroBanner({
  imageSrc,
  variant,
  eyebrow,
  title,
  subtitle,
  children,
}: HeroBannerProps) {
  const isFarmer = variant === "farmer";
  const tint = isFarmer ? "#3D2E1B" : "#0B2A1D";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl",
        isFarmer ? "min-h-[300px] sm:min-h-[340px]" : "min-h-[190px] sm:min-h-[210px]"
      )}
    >
      {/* Photo layer — slow Ken Burns zoom-in on mount, tint blended underneath
          the url() so it still degrades gracefully if the image is missing. */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 9, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(${tint}, ${tint}), url('${imageSrc}')`,
          backgroundBlendMode: "multiply",
        }}
      />

      {isFarmer ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332] via-[#1B4332]/55 to-[#1B4332]/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#E8A33D]/30 blur-2xl" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2A1D]/92 via-[#1B4332]/40 to-transparent" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#2D6A4F]/30 blur-2xl" />
        </>
      )}

      <div
        className={cn(
          "relative flex h-full flex-col p-6 sm:p-8",
          isFarmer ? "justify-end text-center sm:text-left" : "justify-center"
        )}
      >
        {eyebrow && (
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 self-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm sm:self-start">
            {eyebrow}
          </span>
        )}
        <h1
          className={cn(
            "font-serif font-semibold text-white",
            isFarmer ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-2 text-sm text-white/85 sm:text-base",
              isFarmer ? "mx-auto max-w-sm sm:mx-0" : "max-w-md"
            )}
          >
            {subtitle}
          </p>
        )}
        {children && <div className={cn("mt-5", isFarmer && "flex justify-center sm:justify-start")}>{children}</div>}
      </div>
    </div>
  );
}
