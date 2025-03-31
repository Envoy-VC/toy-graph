import { z } from 'zod';
import { getUserContributions } from '~/helpers/github';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const githubRouter = createTRPCRouter({
  getContributions: publicProcedure
    .input(z.object({ username: z.string().min(1), year: z.number() }))
    .mutation(async ({ input }) => {
      const data = await getUserContributions(input);
      return data;
    }),
});
