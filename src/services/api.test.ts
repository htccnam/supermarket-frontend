import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("encodes product searches and sends credentials", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 })
    );

    await api.products("milk & bread");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/products?search=milk%20%26%20bread",
      expect.objectContaining({
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      })
    );
  });

  it("surfaces API error messages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 })
    );

    await expect(api.login("staff@example.com", "wrong")).rejects.toThrow("Invalid credentials");
  });
});
