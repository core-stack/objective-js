

import { defaultExt, File, Finder, Logger, Manager } from '@zetten/core';

import { Bootstrap, bootstrapSchema } from './schema';

const defaultPatterns = `**/*.cron.${defaultExt}`;

export abstract class BootstrapManager implements Manager {
  private files: File<Bootstrap>[] = [];
  constructor(private baseDir: string, private logger: Logger = console) { }

  init(): void {
    this.readFrom(this.baseDir, ...defaultPatterns);
  }

  async readFrom(baseDir: string, ...pattern: string[]) {
    if (!pattern.length) pattern = [defaultPatterns];
    
    const files = await Finder.find<Bootstrap>(baseDir, bootstrapSchema, ...pattern);
    files.forEach(file => {
      if (file.module.ignore) {
        this.logger.info(`Ignoring bootstrap: ${file.name}`);
        return;
      }
      this.files.push(file);
    });
  }

  abstract run(): void;
}