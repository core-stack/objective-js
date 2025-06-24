import { defaultExt, File, Finder, Logger } from '@zetten/core';

import { Queue, queueSchema } from './schema';

const defaultPatterns = `**/*.queue.${defaultExt}`;

export abstract class QueueManager {
  private files: File<Queue>[] = [];
  constructor(private baseDir: string, private logger: Logger = console) { }

  init(): void {
    this.readFrom(this.baseDir, ...defaultPatterns);
  }

  async readFrom(baseDir: string, ...pattern: string[]) {
    if (!pattern.length) pattern = [defaultPatterns];
    
    const files = await Finder.find(baseDir, queueSchema, ...pattern);
    files.forEach(file => {
      if (file.module.ignore) {
        this.logger.info(`Ignoring queue: ${file.name}`);
        return;
      }
      this.files.push(file);
    });
  }

  abstract run(): void;
}