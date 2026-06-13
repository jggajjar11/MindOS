import { describe, test, expect } from "vitest";
import { 
  checkCrisisKeywords, 
  formatMinSec, 
  getWellnessScoreColor, 
  validateOnboarding 
} from "./wellnessUtils";

describe("MindOS Student Wellness Utility Suite", () => {
  
  describe("checkCrisisKeywords", () => {
    test("returns true for high-risk clinical words", () => {
      expect(checkCrisisKeywords("I have been thinking about suicide under exam stress")).toBe(true);
      expect(checkCrisisKeywords("Sometimes I want to self-harm when I fail mock exams")).toBe(true);
    });

    test("returns false for normal study phrases", () => {
      expect(checkCrisisKeywords("This JEE practice test is extremely hard and frustrating")).toBe(false);
      expect(checkCrisisKeywords("I need to study more and schedule my breaks")).toBe(false);
      expect(checkCrisisKeywords("")).toBe(false);
    });
  });

  describe("formatMinSec", () => {
    test("correctly formats elapsed seconds to mm:ss format", () => {
      expect(formatMinSec(180)).toBe("3:00");
      expect(formatMinSec(45)).toBe("0:45");
      expect(formatMinSec(65)).toBe("1:05");
    });

    test("handles zero and negative seconds gracefully", () => {
      expect(formatMinSec(0)).toBe("0:00");
      expect(formatMinSec(-10)).toBe("0:00");
    });
  });

  describe("getWellnessScoreColor", () => {
    test("returns emerald color for excellent wellness scores", () => {
      expect(getWellnessScoreColor(85)).toContain("emerald");
      expect(getWellnessScoreColor(75)).toContain("emerald");
    });

    test("returns indigo color for moderate wellness scores", () => {
      expect(getWellnessScoreColor(60)).toContain("indigo");
      expect(getWellnessScoreColor(50)).toContain("indigo");
    });

    test("returns yellow/rose color for lower ranges", () => {
      expect(getWellnessScoreColor(35)).toContain("amber");
      expect(getWellnessScoreColor(15)).toContain("rose");
    });
  });

  describe("validateOnboarding", () => {
    test("succeeds with valid name and exam preset", () => {
      const res = validateOnboarding("Jainish", "MCAT");
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    test("fails with empty name", () => {
      const res = validateOnboarding("", "MCAT");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("name");
    });

    test("fails with short name", () => {
      const res = validateOnboarding("J", "MCAT");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("at least 2 characters");
    });

    test("fails with empty exam target", () => {
      const res = validateOnboarding("Jainish", "");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("exam preset");
    });
  });

});
