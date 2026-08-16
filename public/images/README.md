# Hero photos

This app expects two photos here that HeroBanner.tsx references:

- `farmer-hero.jpg` — used behind the farmer view's "Your harvest, straight
  to buyers" hero. Look for something warm/golden-hour: a farm field, crops
  close-up, or hands holding produce. Landscape orientation, at least 1200px
  wide works well since it's a tall banner (min-h-[300px] on mobile).

- `vendor-hero.jpg` — used behind the vendor view's "Fresh near you" banner.
  Look for something that reads as "fresh market": crates of vegetables, a
  stall, produce close-up. This banner is shorter (min-h-[190px]), so a
  wider/flatter photo works better than a tall one.

Free sources with usable licenses: unsplash.com, pexels.com.
Suggested search terms — farmer-hero: "farm field harvest sunrise india" /
vendor-hero: "fresh vegetable market crates".

If these files aren't here yet, the banners still render fine — they fall
back to a solid tinted color block (see the linear-gradient + url() layering
in HeroBanner.tsx) instead of a broken image icon.
