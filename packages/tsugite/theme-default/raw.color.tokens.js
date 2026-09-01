// RAW COLOR PALETTE — the single source (T7, ADR-0003/0004 applied to the
// support axis). Authored 100% in oklch: perceptually uniform, tone scales
// never pass through dirty midtones. The generator derives EVERYTHING else:
// @property registrations, the modern oklch branch, and the gamut-mapped
// sRGB fallback branch (CSS Color 4 chroma-clamp — L and H preserved, the
// same mapping a browser applies on an sRGB display).
//
// The three hand-maintained copies in color.constant.scss are retired.

export const rawColorTokens = {
  "--COLOR-N00": "oklch(100% 0 0)",
  "--COLOR-N05": "oklch(98.5% 0.005 257.46)",
  "--COLOR-N10": "oklch(0.97 0.01 257.46)",
  "--COLOR-N15": "oklch(95% 0.015 257.46)",
  "--COLOR-N20": "oklch(93% 0.02 257.46)",
  "--COLOR-N25": "oklch(89% 0.025 257.46)",
  "--COLOR-N30": "oklch(85% 0.03 257.46)",
  "--COLOR-N35": "oklch(80% 0.035 257.46)",
  "--COLOR-N40": "oklch(75% 0.04 257.46)",
  "--COLOR-N45": "oklch(70% 0.04 257.46)",
  "--COLOR-N50": "oklch(65% 0.04 257.46)",
  "--COLOR-N55": "oklch(58.97% 0.0359 257.46)",
  "--COLOR-N60": "oklch(52.94% 0.0318 257.46)",
  "--COLOR-N65": "oklch(46.91% 0.0277 257.46)",
  "--COLOR-N70": "oklch(40.88% 0.0236 257.46)",
  "--COLOR-N75": "oklch(34.85% 0.0194 257.46)",
  "--COLOR-N80": "oklch(28.82% 0.0153 257.46)",
  "--COLOR-N85": "oklch(22.79% 0.0112 257.46)",
  "--COLOR-N90": "oklch(16.76% 0.0071 257.46)",
  "--COLOR-N95": "oklch(11.24% 0.0087 257.46)",
  "--COLOR-B05": "oklch(96.63% 0.0144 264.5)",
  "--COLOR-B10": "oklch(91.11% 0.0439 253.6)",
  "--COLOR-B20": "oklch(83.67% 0.08296 253.6937)",
  "--COLOR-B30": "oklch(74.76% 0.1321 254.77)",
  "--COLOR-B40": "oklch(67.38% 0.1748 256)",
  "--COLOR-B50": "oklch(61.48% 0.2103 257.24)",
  "--COLOR-B60": "oklch(46.65% 0.1873 258.22)",
  "--COLOR-B70": "oklch(38.13% 0.132 258.15)",
  "--COLOR-B80": "oklch(27.26% 0.0925 257.49)",
  "--COLOR-B90": "oklch(18.34% 0.0645 256.77)",
  "--COLOR-B95": "oklch(11.28% 0.043 258.66)",
  "--COLOR-R50": "oklch(67.92% 0.23 19.06)",
  "--COLOR-G50": "oklch(70% 0.18 158.7)",
  "--COLOR-Y80": "oklch(91.76% 0.16 95.72)",
  "--COLOR-PI10": "oklch(96.03% 0.0291 334.38)",
  "--COLOR-PI25": "oklch(88.25% 0.091 335.35)",
  "--COLOR-PI50": "oklch(67.13% 0.2851 343.06)",
  "--COLOR-PI70": "oklch(34.2% 0.146752 342.809)",
  "--COLOR-PI85": "oklch(24.24% 0.1048 341.09)",
  // YE existed only as hex upstream (never converted); oklch-ified here so the
  // whole palette speaks one language. Derived exactly from the hex originals.
  "--COLOR-YE05": "oklch(97.39% 0.0437 95.85)",
  "--COLOR-YE20": "oklch(93.82% 0.104 96.09)",
  "--COLOR-YE50": "oklch(86.92% 0.1765 91.17)",
  "--COLOR-YE70": "oklch(44.61% 0.0913 92.51)",
  "--COLOR-YE95": "oklch(24.96% 0.0513 95.71)",
};
