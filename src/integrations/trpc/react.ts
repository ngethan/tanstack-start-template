import type { TRPCRouter } from "@/integrations/trpc/root";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const { TRPCProvider, useTRPC } = createTRPCContext<TRPCRouter>();
