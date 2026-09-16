import { describe, it, expect, vi, beforeEach } from "vitest";

type NextAuthConfig = {
  callbacks?: {
    jwt?: (args: { token: Record<string, unknown>; account?: { access_token?: string } | null }) => Record<string, unknown>;
    session?: (args: { session: Record<string, unknown>; token: Record<string, unknown> }) => Record<string, unknown>;
  };
};
let capturedConfig: NextAuthConfig | null = null;
let githubProviderOptions: unknown[] = [];

vi.mock("next-auth", () => ({
  default: vi.fn((config: NextAuthConfig) => {
    capturedConfig = config;
    return {
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  }),
}));

vi.mock("next-auth/providers/github", () => ({
  default: vi.fn((options?: unknown) => {
    githubProviderOptions.push(options);
    return { id: "github", name: "GitHub" };
  }),
}));

describe("auth", () => {
  beforeEach(async () => {
    capturedConfig = null;
    githubProviderOptions = [];
    vi.resetModules();

    // Re-mock after resetModules
    vi.doMock("next-auth", () => ({
      default: vi.fn((config: NextAuthConfig) => {
        capturedConfig = config;
        return {
          handlers: { GET: vi.fn(), POST: vi.fn() },
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
        };
      }),
    }));

    vi.doMock("next-auth/providers/github", () => ({
      default: vi.fn((options?: unknown) => {
        githubProviderOptions.push(options);
        return { id: "github", name: "GitHub" };
      }),
    }));
  });

  it("exports handlers, auth, signIn, signOut", async () => {
    const authModule = await import("@/lib/auth");
    expect(authModule.handlers).toBeDefined();
    expect(authModule.auth).toBeDefined();
    expect(authModule.signIn).toBeDefined();
    expect(authModule.signOut).toBeDefined();
  });

  // Regression: GitHub implements RFC 9207 and returns `iss` on the OAuth
  // callback. Without an explicit issuer, @auth/core compares it against its
  // `https://authjs.dev` placeholder and every sign-in fails with
  // CallbackRouteError: unexpected "iss" (issuer) response parameter value.
  it("configures the GitHub provider with GitHub's RFC 9207 issuer", async () => {
    await import("@/lib/auth");

    expect(githubProviderOptions).toHaveLength(1);
    expect(githubProviderOptions[0]).toMatchObject({
      issuer: "https://github.com/login/oauth",
    });
  });

  it("JWT callback sets token.accessToken from account on login", async () => {
    await import("@/lib/auth");
    expect(capturedConfig).not.toBeNull();

    const token = { sub: "123" };
    const account = { access_token: "gh_token_abc" };

    const result = capturedConfig!.callbacks!.jwt!({ token, account }) as { accessToken?: string };
    expect(result.accessToken).toBe("gh_token_abc");
  });

  it("JWT callback passes through token when no account", async () => {
    await import("@/lib/auth");

    const token = { sub: "123", accessToken: "existing_token" };
    const result = capturedConfig!.callbacks!.jwt!({ token, account: null }) as { accessToken?: string };
    expect(result.accessToken).toBe("existing_token");
  });

  it("session callback sets session.accessToken from token", async () => {
    await import("@/lib/auth");

    const session = { user: { name: "Test" } };
    const token = { accessToken: "gh_token_abc" };

    const result = capturedConfig!.callbacks!.session!({ session, token }) as { accessToken?: string };
    expect(result.accessToken).toBe("gh_token_abc");
  });
});
