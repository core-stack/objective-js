import { Logger } from '../logger';

export interface IServerAdapter {
  listen(port: number): Promise<void>;
  addRoute(method: string, path: string, handler: any): void;
}

export interface ServerConfig {
  port: number;
  adapter: IServerAdapter;
  logger?: Logger;
}