import { Zetten } from '../server';

export interface Manager {
  run(): void;
  init(zetten: Zetten): void | Promise<void>;
}