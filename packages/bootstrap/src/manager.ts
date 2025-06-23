

import { defaultExt, File, Finder, Logger } from '@objective-js/core';

import { Bootstrap, bootstrapSchema } from './schema';

const defaultPatterns = `**/*.cron.${defaultExt}`;

export abstract class BootstrapManager {
  private files: File<Bootstrap>[] = [];
  constructor(private logger: Logger) { }

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