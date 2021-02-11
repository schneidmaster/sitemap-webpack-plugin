import { assertValidChangefreq } from "../src/helpers";

describe("Sitemap helpers", () => {
  describe("assertValidChangefreq", () => {
    it("does not error for valid changefreq", () => {
      expect(() => assertValidChangefreq("always")).not.toThrow();
    });

    it("does error for invalid changefreq", () => {
      expect(() => assertValidChangefreq("occasionally")).toThrow(
        new Error("Invalid changefreq option: occasionally")
      );
    });
  });
});
