/// <reference path="./.sst/platform/config.d.ts" />

/**
 * Storefront — one deployment serving every tenant.
 *
 * A Router owns the domain and fans out by path: /api/* to the Express API,
 * everything else to the Next.js app. Both sit on the same hostname, so the
 * browser's Host header carries the tenant and there is no CORS at all.
 *
 * The wildcard alias is what makes tenancy zero-touch — any
 * <tenant>.allinoneshop.store reaches this same pair, so onboarding a shop
 * needs no deploy and no certificate work.
 */
/**
 * Resolves a secret. Prefers the process environment so CI can inject values
 * through repository secrets, and falls back to backend/.env for local deploys.
 * Either way nothing sensitive is written into a tracked file.
 */
function env(key: string): string {
  if (process.env[key]) return process.env[key] as string;

  const fs = require("fs");
  if (fs.existsSync("backend/.env")) {
    const line = fs.readFileSync("backend/.env", "utf8")
      .split("\n")
      .find((l: string) => l.startsWith(key + "="));
    if (line) return line.slice(key.length + 1).trim();
  }
  throw new Error(`${key} is not set — export it or add it to backend/.env`);
}

/** Route53 zone and the wildcard cert provisioned for this domain. */
const ZONE = "Z04324423NALZ4VWGZ6FR";
const CERT = "arn:aws:acm:us-east-1:293528979228:certificate/e970e2b6-8ee2-44bc-99c9-208daebe46a9";

export default $config({
  app(input) {
    return {
      name: "oneshop-storefront",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: { aws: { region: "ap-south-1" } },
    };
  },
  async run() {
    const api = new sst.aws.Function("StorefrontApi", {
      handler: "backend/src/lambda.handler",
      runtime: "nodejs22.x",
      memory: "512 MB",
      timeout: "30 seconds",
      url: { cors: false },
      environment: {
        NODE_ENV: "production",
        MONGODB_URI: env("MONGODB_URI"),
        JWT_SECRET: env("JWT_SECRET"),
        TENANT_FACTORY_DB: "oneshop-tenant-factory",
        // Tenants are subdomains, so CORS is validated against this suffix.
        PLATFORM_DOMAIN: "allinoneshop.store",
        DEFAULT_TENANT_DB: "oneshop_open_door",
        // CloudFront rewrites Host to the origin's name; the real hostname
        // arrives in X-Forwarded-Host, which is where the tenant comes from.
        TRUST_PROXY_HOST: "true",
        ALLOW_TENANT_HEADER: "false",
        ASSET_BASE_URL: "https://cdn.allinoneshop.store",
        FRONTEND_URL: "https://allinoneshop.store",
      },
    });

    const router = new sst.aws.Router("StorefrontRouter", {
      domain: {
        name: "allinoneshop.store",
        aliases: ["*.allinoneshop.store"],
        cert: CERT,
        dns: sst.aws.dns({ zone: ZONE }),
      },
    });

    // Inline `routes` is deprecated in SST 4.17 and conflicts with attaching a
    // site to the same router; route() is the supported form.
    router.route("/api", api.url);

    new sst.aws.Nextjs("Storefront", {
      path: "frontend",
      router: { instance: router },
      environment: { NEXT_PUBLIC_API_URL: "/api" },
    });

    return { api: api.url, url: router.url };
  },
});
