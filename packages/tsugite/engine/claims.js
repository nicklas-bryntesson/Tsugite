// CLAIMS — a composition claims a voice from CSS (ADR-0006, amended 2026-10-17).
//
// An attribute cannot change inside a query, so a composition whose content changes ground at
// a point cannot write data-theme there. It points the --theme-* channels at the voice's
// pointers instead, one line per channel. Those lines are machine-shaped — one per channel in
// the slot schema — so the composition writes the claim as data in its recipe and this file
// writes the CSS. The range is the composition's own: a container query, and the viewport
// query as its fallback where containers are unsupported (doctrine §5: a pair, fallback first,
// nothing declared in both).
import { themeChannels, voiceMatrix, voicePointerName } from "../theme-default/theme.voices.tokens.js";

const condition = (feature, { min, max }) =>
  [min && `(min-${feature}: ${min})`, max && `(max-${feature}: calc(${max} - 0.001rem))`].filter(Boolean).join(" and ");

/** The channel lines of one claim, at the given indent. */
export function claimLines(voice, volume, indent) {
  if (!voiceMatrix[voice]?.includes(volume)) {
    throw new Error(`a claim of ${voice} × ${volume} is not an allowed combination (ADR-0006 §6)`);
  }
  return Object.entries(themeChannels).map(
    ([key, channel]) => `${indent}${channel}: var(${voicePointerName(voice, volume, key)});`,
  );
}

/** The claims stylesheet for one recipe. */
export function generateClaimsStylesheet(recipe, source) {
  const root = `.${recipe.class}`;
  const blocks = (recipe.claims ?? []).map(({ part, range, voice, volume }) => {
    if (!range.min && !range.max) throw new Error(`${recipe.name}: a claim needs a range`);
    const lines = (indent) => claimLines(voice, volume, indent).join("\n");
    return [
      `/* ${part}: ${voice} × ${volume}${range.min ? ` from ${range.min}` : ""}${range.max ? ` below ${range.max}` : ""} */`,
      `${root} {`,
      "  @supports not (container-type: inline-size) {",
      `    @media ${condition("width", range)} {`,
      `      & .${part} {`,
      lines("        "),
      "      }",
      "    }",
      "  }",
      "",
      "  @supports (container-type: inline-size) {",
      `    @container ${condition("width", range)} {`,
      `      & .${part} {`,
      lines("        "),
      "      }",
      "    }",
      "  }",
      "}",
    ].join("\n");
  });
  return [
    `/* GENERATED — do not edit. Source: ${source} (claims) via engine/claims.js.`,
    "   A composition's voice claims: in its range, the part's channels point at the voice's",
    "   pointers (ADR-0006, amended 2026-10-17). Regenerate: pnpm tokens   (freshness guarded",
    "   by tests/claims.test.ts) */",
    "",
    ...blocks,
    "",
  ].join("\n");
}
