import z from 'zod';

export const middlewareFn = z.union([
  z.function(),
  z.array(z.function())
]).optional();

export const middlewareSchema = z.object({
  middleware: middlewareFn,
  ignore: z.boolean().default(false).optional()
});
export type Middleware = z.infer<typeof middlewareSchema>;

export const handlerOptionsSchema = z.object({
  schema: z.object({
    body: z.any().optional(),
    query: z.any().optional(),
    params: z.any().optional(),
    response: z.record(
      z.number().int().positive(),
      z.any()
    ).optional()
  }),
  config: z.object({
    rateLimit: z.object({
      max: z.number().int().positive(),
      timeWindow: z.string().or(z.number())
    }).optional()
  }).optional()
});

export type HandlerOptions = z.infer<typeof handlerOptionsSchema>;

export const handlerSchema = z.object({
  handler: z.function(),
  options: handlerOptionsSchema,
  middlewares: middlewareFn.optional(),
  ignore: z.boolean().default(false).optional(),
})

export type Handler = z.infer<typeof handlerSchema>;