/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ecommerce-storefront",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {

    // Deploy the API Lambda first
    const api = new sst.aws.Function("StorefrontApi", {
      handler: "backend/src/server.handler",
      runtime: "nodejs22.x",      // pin: Node.js 24 dropped callback-style handlers
      timeout: "30 seconds",       // MongoDB Atlas cold-connect needs ~5-8s; 3s default is too low
      memory: "512 MB",            // more memory = more vCPU = faster cold starts
      url: { cors: false },
      environment: {
        PAYHERE_MERCHANT_SECRET: "MjY4MzgxNzgzNDMxNzkzNDQ4MjYwOTY1MTcwNDI4OTYxNDk3NzI=",
        MONGODB_URI: process.env.MONGODB_URI || "",
        JWT_SECRET: process.env.JWT_SECRET || "",
      },
    });

    // Deploy the Next.js frontend, inject the API URL (with /api suffix)
    const web = new sst.aws.Nextjs("StorefrontWeb", {
      path: "frontend",
      domain: "opendoor.allinoneshop.store",
      environment: {
        // Lambda URL already ends with "/", so append "api"
        NEXT_PUBLIC_API_URL: $interpolate`${api.url}api`,
        NEXT_PUBLIC_PAYHERE_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || "1235406",
      },
    });

    // Feed the frontend URL back to the API so CORS allows it
    // (SST Output values are lazy — this is resolved at deploy time)
    return {
      api: api.url,
      web: web.url,
    };
  },
});

// trigger deploy for payhere