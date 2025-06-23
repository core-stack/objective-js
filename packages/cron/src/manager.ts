

import { defaultExt, File, Finder, Logger } from '@objective-js/core';

import { CronJob, cronJobSchema } from './schema';

const defaultPatterns = `**/*.cron.${defaultExt}`;

export abstract class CronManager {
  private files: File<CronJob>[] = [];
  constructor(private logger: Logger) { }

  async readFrom(baseDir: string, ...pattern: string[]) {
    if (!pattern.length) pattern = [defaultPatterns];
    
    const files = await Finder.find<CronJob>(baseDir, cronJobSchema, ...pattern);
    files.forEach(file => {
      if (file.module.ignore) {
        this.logger.info(`Ignoring cron job: ${file.name}`);
        return;
      }
      this.files.push(file);
    });
  }

  abstract run(): void;
}