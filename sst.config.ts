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
    
    const api = new sst.aws.Function("StorefrontApi", {
      handler: "backend/src/server.handler", 
      url: true,
      environment: {
        PAYHERE_MERCHANT_SECRET: process.env.PAYHERE_MERCHANT_SECRET || "",
        MONGODB_URI: process.env.MONGODB_URI || "",
        JWT_SECRET: process.env.JWT_SECRET || "",
      },
    });

  
    new sst.aws.Nextjs("StorefrontWeb", {
      path: "frontend",
      environment: {
        NEXT_PUBLIC_API_URL: api.url,
      },
    });
  },
});