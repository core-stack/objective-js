import fastGlob from 'fast-glob';
import path from 'path';
import { z } from 'zod';

export interface File<T> {
  path: string;
  name: string;
  module: T;
}
export interface FileWithSkip<T> extends File<T> {
  skip?: boolean;
}
export class Finder {
  static async find<T>(
    baseDir: string,
    schema: z.ZodType<T>,
    ...patterns: string[]
  ): Promise<File<T>[]> {
    if (patterns.length === 0) {
      patterns = ['**/*.js', '**/*.ts'];
    }
    const files = await fastGlob(patterns, {
      cwd: baseDir,
      absolute: true,
      onlyFiles: true,
    });

    const results = await Promise.all(
      files.map(async (filePath): Promise<FileWithSkip<T>> => {
        const parsed = path.parse(filePath);
        
        try {
          const module = schema.parse(await import(filePath));         
          return {
            path: filePath,
            name: parsed.name,
            module: module,
            skip: false
          };
        } catch (error) {
          console.error(`Error importing file ${filePath}:`, error);
          return {
            module: {} as T,
            path: filePath,
            name: parsed.name,
            skip: true
          };
        }
      })
    );

    return results.filter((result) => !result.skip) as File<T>[];
  }
}