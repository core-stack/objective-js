import { z } from 'zod';

export const queueOptionsSchema = z.object({
  // Configurações básicas
  name: z.string().min(1, "Queue name must be at least 1 character long"),
  redis: z.string().url("Invalid Redis URL"),
  
  limiter: z.object({
    max: z.number().int().positive(),
    duration: z.number().int().positive(),
    groupKey: z.string().optional(),
  }).optional(),
  
  
  defaultJobOptions: z.object({
    priority: z.number().int().min(1).max(10).optional(),
    delay: z.number().int().min(0).optional(),
    attempts: z.number().int().min(1).optional(),
    backoff: z.union([
      z.number(),
      z.object({
        type: z.enum(["fixed", "exponential"]),
        delay: z.number(),
      }),
    ]).optional(),
    timeout: z.number().int().min(0).optional(),
    removeOnComplete: z.union([z.boolean(), z.number().int().positive()]).optional(),
    removeOnFail: z.union([z.boolean(), z.number().int().positive()]).optional(),
    stackTraceLimit: z.number().int().min(0).optional(),
  }).optional(),
  
  settings: z.object({
    maxStalledCount: z.number().int().min(0).optional(),
    retryProcessDelay: z.number().int().min(0).optional(),
    guardInterval: z.number().int().min(0).optional(),
    drainDelay: z.number().int().min(0).optional(),
  }).optional(),
}).strict();

export type QueueOptions = z.infer<typeof queueOptionsSchema>;

export const jobDataSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.date(),
    z.record(z.any()),
    z.array(z.any()),
  ])
).refine(data => Object.keys(data).length > 0, {
  message: "Job data não pode ser vazio"
});

export type JobData = z.infer<typeof jobDataSchema>;

export const workerOptionsSchema = z.object({
  concurrency: z.number().int().positive(),
  limiter: z.object({
    max: z.number().int().positive(),
    duration: z.number().int().positive(),
  }).optional(),
  settings: z.object({
    lockDuration: z.number().int().positive(),
    lockRenewTime: z.number().int().positive().optional(),
    stalledInterval: z.number().int().positive().optional(),
    maxStalledCount: z.number().int().min(0).optional(),
    drainDelay: z.number().int().positive().optional(),
  }).optional(),
  metrics: z.object({
    maxDataPoints: z.number().int().positive().optional(),
  }).optional(),
}).strict();

export type WorkerOptions = z.infer<typeof workerOptionsSchema>;

export const queueEventsSchema = z.object({
  onCompleted: z.function().args(z.string()).returns(z.void()).optional(),
  onFailed: z.function().args(z.string(), z.string()).returns(z.void()).optional(),
  onProgress: z.function().args(z.string(), z.number()).returns(z.void()).optional(),
}).strict();

export type QueueEvents = z.infer<typeof queueEventsSchema>;

export const jobProcessorSchema = z.function()
  .args(
    z.object({
      id: z.string(),
      data: jobDataSchema,
      progress: z.function().args(z.number()).returns(z.void()),
    })
  )
  .returns(z.promise(z.void()));

export type JobProcessor = z.infer<typeof jobProcessorSchema>;

export const queueSchema = z.object({
  options: queueOptionsSchema,
  events: queueEventsSchema,
  workerOptions: workerOptionsSchema,
  jobProcessor: jobProcessorSchema,
  ignore: z.boolean().default(false).optional()
}).strict();

export type Queue = z.infer<typeof queueSchema>;