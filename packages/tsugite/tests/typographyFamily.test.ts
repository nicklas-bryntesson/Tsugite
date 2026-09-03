// The typography family's combination law, enforced (the door law):
// for any (voice × element × input shape) there is exactly ONE component.
// Same doctrine as the theme voiceMatrix (ADR-0006 §6).
import { describe, it, expect } from "vitest";
import { FAMILY, VOICE_SIZES } from "../lib/typographyFamily.ts";

describe("the typography family contract", () => {
  it("every voice a component speaks exists in the size grammar", () => {
    for (const [component, member] of Object.entries(FAMILY)) {
      for (const voice of Object.keys(member.voices)) {
        expect(VOICE_SIZES[voice], `${component} speaks unknown voice "${voice}"`).toBeDefined();
        expect(VOICE_SIZES[voice].length, `voice "${voice}" has no size stops`).toBeGreaterThan(0);
      }
    }
  });

  it("every voice row lists at least one element", () => {
    for (const [component, member] of Object.entries(FAMILY)) {
      for (const [voice, elements] of Object.entries(member.voices)) {
        expect(elements.length, `${component}/${voice} allows no elements`).toBeGreaterThan(0);
      }
    }
  });

  it("the door law: one component per (voice × element × input)", () => {
    const doors = new Map<string, string>();
    for (const [component, member] of Object.entries(FAMILY)) {
      for (const [voice, elements] of Object.entries(member.voices)) {
        for (const element of elements) {
          const key = `${voice} × ${element} × ${member.input}`;
          const existing = doors.get(key);
          expect(
            existing,
            `two doors to "${key}": ${existing} and ${component}`,
          ).toBeUndefined();
          doors.set(key, component);
        }
      }
    }
  });
});
