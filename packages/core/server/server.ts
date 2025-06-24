import { Logger } from '../logger';
import { Manager } from '../manager';
import { IServerAdapter, ServerConfig } from './types';

export class Zetten {
  private managers: Manager[] = [];
  private serverAdapter: IServerAdapter;
  private logger: Logger;

  constructor(private config: ServerConfig) {
    this.serverAdapter = config.adapter;
    this.logger = config.logger || console;
  }

  public registerManager(manager: Manager): this {
    this.managers.push(manager);
    return this;
  }

  public async start(port?: number): Promise<void> {
    await this.initializeManagers();
    
    await this.serverAdapter.listen(port || this.config.port || 3000);
    this.logger.info(`Server running on port ${port || this.config.port}`);
  }

  getServerAdapter(): IServerAdapter {
    return this.serverAdapter;
  }

  private async initializeManagers(): Promise<void> {
    for (const manager of this.managers) {
      if (manager) {
        await manager.init(this);
      }
    }
  }
}