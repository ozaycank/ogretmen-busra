import { describe, it, expect } from "vitest";
import { slugify, MAX_SLUG_LENGTH, createUniqueSlugCandidate } from "./slugify";

describe("slugify utility", () => {
    it("should replace Turkish characters correctly", () => {
        expect(slugify("ÇğİöŞü çğıöşü")).toBe("cgiosu-cgiosu");
    });

    it("should output valid regex format with multiple spaces/dashes", () => {
        const output = slugify("  - Çok    Fazla --- Boşluk -  ");
        expect(output).toBe("cok-fazla-bosluk");
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(output)).toBe(true);
    });

    it("should fallback to untitled for emoji-only or invalid inputs", () => {
        expect(slugify("🚀🌟")).toBe("untitled");
        expect(slugify("")).toBe("untitled");
    });
});

describe("createUniqueSlugCandidate", () => {
    const dummyId = "a1b2c3d4-xxxx-yyyy-zzzz";
    const dummyPrefix = "a1b2c3d4"; // first 8 chars

    it("Test 1: 180 chars base + UUID suffix -> final length <= 180", () => {
        const existing = new Set<string>();
        const veryLongBase = "a".repeat(200);
        existing.add("a".repeat(180)); // Simulate collision on base to force suffix

        const candidate = createUniqueSlugCandidate(veryLongBase, dummyId, existing);

        expect(candidate.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
        expect(candidate.endsWith(`-${dummyPrefix}`)).toBe(true);
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)).toBe(true);
    });

    it("Test 2: Collision counter works and limits length", () => {
        const existing = new Set<string>();
        const base = "test";

        // Simulate multi-level collision
        existing.add("test");
        existing.add(`test-${dummyPrefix}`);
        existing.add(`test-${dummyPrefix}-1`);

        const candidate = createUniqueSlugCandidate(base, dummyId, existing);

        expect(candidate).toBe(`test-${dummyPrefix}-2`);
        expect(candidate.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    });

    it("Test 3: Extreme long base + high counter -> regex valid and <= 180", () => {
        const existing = new Set<string>();
        const veryLongBase = "a".repeat(180);

        existing.add(veryLongBase);
        existing.add("a".repeat(180 - 9) + `-${dummyPrefix}`);
        // Next candidate will use counter 1 -> suffix length 11 -> "-a1b2c3d4-1"

        const candidate = createUniqueSlugCandidate(veryLongBase, dummyId, existing);

        expect(candidate.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
        expect(candidate.endsWith(`-${dummyPrefix}-1`)).toBe(true);
        // Ensure no trailing/double dashes in the middle caused by truncation
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)).toBe(true);
    });

    it("Test 4: Deterministic output for same inputs", () => {
        const existing = new Set<string>();
        const res1 = createUniqueSlugCandidate("Deterministic Test", dummyId, existing);
        const res2 = createUniqueSlugCandidate("Deterministic Test", dummyId, existing);
        expect(res1).toBe("deterministic-test");
        expect(res2).toBe("deterministic-test");
    });
});