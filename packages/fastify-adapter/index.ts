import fastify, { FastifyInstance } from 'fastify';

import { IServerAdapter } from '@zetten/core';
import { HandlerManager } from '@zetten/handler';

export class FastifyAdapter implements IServerAdapter {
  instance: FastifyInstance;
  handler?: HandlerManager;
  constructor() {
    this.instance = fastify()
  }

  async listen(port: number): Promise<void> {
    await this.instance.listen({ port });
  }

  addRoute(method: string, path: string, handler: any): void {
    this.instance.route({
      method,
      url: path,
      handler,
    })
  }
}