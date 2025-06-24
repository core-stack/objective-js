

import { defaultExt, File, Finder, Logger, Manager } from '@zetten/core';

import { CronJob, cronJobSchema } from './schema';

const defaultPatterns = `**/*.cron.${defaultExt}`;

export abstract class CronManager implements Manager {
  private files: File<CronJob>[] = [];
  constructor(private baseDir: string, private logger: Logger = console) { }

  init(): void {
    this.readFrom(this.baseDir, ...defaultPatterns);
  }

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
}