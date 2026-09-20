// The typography family's combination law, enforced (the door law):
// for any (voice × element × input shape) there is exactly ONE component.
// Same doctrine as the theme voiceMatrix (ADR-0006 §6).
import { describe, it, expect } from "vitest";
import { FAMILY, VOICE_SIZES } from "../lib/typographyFamily.ts";
import { heading } from "../recipes/heading.recipe";
import { text } from "../recipes/text.recipe";
import { textblock } from "../recipes/textblock.recipe";
import { caption } from "../recipes/caption.recipe";

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

  it("the plaintext contract cannot carry emphasis", () => {
    for (const [component, member] of Object.entries(FAMILY)) {
      if (member.input === "plaintext") {
        expect(member.emphasis, `${component}: markup is unrepresentable in plaintext`).toBe("none");
      } else {
        expect(member.emphasis, `${component}: authored input must declare its emphasis law`).not.toBe("none");
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

  // ADR-0018: Heading's table is written out (a table holds no logic), so it must agree
  // with the matrix cell for cell — the voices, each voice's sizes, the element farm, and
  // the cells the body voice does not reach, declared as absences.
  describe("the Heading table agrees with the matrix", () => {
    const member = FAMILY.Heading;
    it("speaks exactly the matrix's voices", () => {
      expect([...heading.axes.variant.values]).toEqual(Object.keys(member.voices));
    });
    it("offers each voice exactly its sizes", () => {
      for (const voice of Object.keys(member.voices)) {
        expect([...heading.axes.size.valuesBy.values[voice as keyof typeof heading.axes.size.valuesBy.values]], voice).toEqual([...VOICE_SIZES[voice]]);
      }
    });
    it("its element farm is the union of the voices' farms", () => {
      const farm = [...new Set(Object.values(member.voices).flat())];
      expect([...heading.element.values]).toEqual(farm);
    });
    it("declares as absent exactly the (voice, element) cells the matrix leaves out", () => {
      const farm = [...new Set(Object.values(member.voices).flat())];
      const missing = Object.entries(member.voices).flatMap(([voice, elements]) => farm.filter((el) => !elements.includes(el)).map((el) => `${voice}/${el}`));
      const declared = heading.absent
        .map((a) => a.cells as Record<string, unknown>)
        .filter((c) => "variant" in c && "element" in c)
        .map((c) => `${c.variant}/${c.element}`);
      expect(declared.sort()).toEqual(missing.sort());
    });
  });

  describe("the Text table agrees with the matrix", () => {
    const member = FAMILY.Text;
    it("speaks exactly the matrix's voices", () => {
      expect([...text.axes.variant.values]).toEqual(Object.keys(member.voices));
    });
    it("offers each voice exactly its sizes", () => {
      for (const voice of Object.keys(member.voices)) {
        expect([...text.axes.size.valuesBy.values[voice as keyof typeof text.axes.size.valuesBy.values]], voice).toEqual([...VOICE_SIZES[voice]]);
      }
    });
    it("its element farm is the union of the voices' farms, and no cell is absent", () => {
      const farm = [...new Set(Object.values(member.voices).flat())];
      expect([...text.element.values]).toEqual(farm);
      const missing = Object.entries(member.voices).flatMap(([voice, elements]) => farm.filter((el) => !elements.includes(el)).map((el) => `${voice}/${el}`));
      expect(missing).toEqual([]);
      const declared = text.absent.map((a) => a.cells as Record<string, unknown>).filter((c) => "variant" in c && "element" in c);
      expect(declared).toEqual([]);
    });
  });

  describe("the TextBlock table agrees with the matrix", () => {
    const member = FAMILY.TextBlock;
    it("speaks exactly the matrix's voices", () => {
      expect([...textblock.axes.variant.values]).toEqual(Object.keys(member.voices));
    });
    it("offers each voice exactly its sizes", () => {
      for (const voice of Object.keys(member.voices)) {
        expect([...textblock.axes.size.valuesBy.values[voice as keyof typeof textblock.axes.size.valuesBy.values]], voice).toEqual([...VOICE_SIZES[voice]]);
      }
    });
    it("its element farm is the union of the voices' farms, and no (voice, element) cell is absent", () => {
      const farm = [...new Set(Object.values(member.voices).flat())];
      expect([...textblock.element.values]).toEqual(farm);
      const missing = Object.entries(member.voices).flatMap(([voice, elements]) => farm.filter((el) => !elements.includes(el)).map((el) => `${voice}/${el}`));
      expect(missing).toEqual([]);
    });
    it("the plaintext contract is an absent cell: child content", () => {
      expect(member.input).toBe("plaintext");
      expect(textblock.absent.some((a) => (a.cells as Record<string, unknown>).children === true)).toBe(true);
    });
  });

  describe("the Caption table agrees with the matrix", () => {
    const member = FAMILY.Caption;
    it("speaks exactly the matrix's voices", () => {
      expect([...caption.axes.variant.values]).toEqual(Object.keys(member.voices));
    });
    it("offers each voice exactly its sizes", () => {
      for (const voice of Object.keys(member.voices)) {
        expect([...caption.axes.size.valuesBy.values[voice as keyof typeof caption.axes.size.valuesBy.values]], voice).toEqual([...VOICE_SIZES[voice]]);
      }
    });
    it("its element farm is the union of the voices' farms, and no cell is absent", () => {
      const farm = [...new Set(Object.values(member.voices).flat())];
      expect([...caption.element.values]).toEqual(farm);
      const missing = Object.entries(member.voices).flatMap(([voice, elements]) => farm.filter((el) => !elements.includes(el)).map((el) => `${voice}/${el}`));
      expect(missing).toEqual([]);
    });
    it("the button voice exists in the size grammar and Button reads it as tokens", () => {
      expect(VOICE_SIZES.button).toEqual(["sm", "md", "lg"]);
    });
  });
});
