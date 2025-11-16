import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
  },

  client: {},

  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {},
});
