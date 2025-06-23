import path from 'path';
import { ZodError } from 'zod';

import { defaultExt, Finder, Logger } from '@objective-js/core';

import { Handler, handlerSchema, Middleware, middlewareSchema } from './schema';

const HTTP_METHODS = ["get", "post", "put", "delete", "patch"] as const;
const defaultPatterns = HTTP_METHODS.map((method) => `**/${method}.handler.${defaultExt}`);

export abstract class HandlerManager {
  private handlers: Handler[] = [];
  constructor(private logger: Logger) { }

  private async findMiddlewares(routeDir: string, baseDir: string): Promise<Middleware[]> {
    const middlewares: Middleware[] = [];
    let currentDir = routeDir;

    while (currentDir.startsWith(baseDir)) {      
      try {
        const files = await Finder.find<Middleware>(currentDir, middlewareSchema, `**/*.middleware.${defaultExt}`);
        files.forEach(file => {
          if (file.module.ignore) {
            this.logger.info(`Ignoring middleware: ${file.name}`);
            return;
          }
          middlewares.push(file.module);
        });
      } catch (error) { 
        if (error instanceof ZodError) {
          this.logger.error(`Invalid middleware options on ${currentDir}: ${error.message}`);
        } else {
          this.logger.error(`Invalid middleware on ${currentDir}: ${error}`);
        }
      }
  
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }
    return middlewares;
  }

  async readFrom(baseDir: string, ...pattern: string[]) {
    if (!pattern.length) pattern = defaultPatterns;
    
    const files = await Finder.find<Handler>(baseDir, handlerSchema, ...pattern);
    files.forEach(async (file) => {
      if (file.module.ignore) {
        this.logger.info(`Ignoring handler: ${file.name}`);
        return;
      }

      const pathMiddlewares = await this.findMiddlewares(file.path, baseDir);

      const pathMiddlewareFns = pathMiddlewares.flatMap(m => 
        Array.isArray(m.middleware) ? m.middleware : [m.middleware]
      );
      let allMiddlewares = [...pathMiddlewareFns];
      if (file.module.middlewares) {
        const handlerMiddlewares = Array.isArray(file.module.middlewares)  ? file.module.middlewares : [file.module.middlewares];
        
        allMiddlewares.push(...handlerMiddlewares);
      }
      const filteredMiddlewares = allMiddlewares.filter(m => m !== undefined);
      this.handlers.push({ ...file.module, middlewares: filteredMiddlewares.length > 0 ? filteredMiddlewares : undefined });
    });
  }

  abstract run(): void;
}