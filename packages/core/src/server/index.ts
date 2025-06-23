import { Logger } from '../logger';
import { Manager } from '../manager';
import { IServerAdapter, ServerConfig } from './types';

type ManagerType = 'queue' | 'handler' | 'cron' | 'bootstrap';

export class Zetten {
  private managers: Record<ManagerType, Manager | null> = {
    queue: null,
    handler: null,
    cron: null,
    bootstrap: null
  };
  private serverAdapter: IServerAdapter;
  private logger: Logger;

  constructor(private config: ServerConfig) {
    this.serverAdapter = config.adapter;
    this.logger = config.logger || console;
  }

  public registerManager(type: ManagerType, manager: any): this {
    this.managers[type] = manager;
    this.logger.info(`Registered ${type} manager`);
    return this;
  }

  public getManager<T>(type: ManagerType): T {
    return this.managers[type] as T;
  }

  public async start(port?: number): Promise<void> {
    await this.initializeManagers();
    
    await this.serverAdapter.listen(port || this.config.port);
    this.logger.info(`Server running on port ${port || this.config.port}`);
  }

  private async initializeManagers(): Promise<void> {
    for (const [type, manager] of Object.entries(this.managers)) {
      if (manager) {
        await manager.init(this);
        this.logger.info(`${type} manager initialized`);
      }
    }
  }
}