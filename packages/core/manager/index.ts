import { Zetten } from '../server';

export interface Manager {
  init(zetten: Zetten): void | Promise<void>;
}