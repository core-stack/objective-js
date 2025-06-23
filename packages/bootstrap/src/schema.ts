import z from 'zod';

export const bootstrapSchema = z.object({
  fn: z.function(),
  options: z.object({
    onError: z.literal("continue").or(z.literal("stop")).default("continue").optional(),
  }),
  ignore: z.boolean().default(false).optional()
});

export type Bootstrap = z.infer<typeof bootstrapSchema>;