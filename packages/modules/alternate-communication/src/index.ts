import { AlternateCommunicationOptions } from './config';
import { createUseCases } from './app/use-cases';
import { createRestRouter, RestRouterFactory } from './http/rest-router';
import { createEventBus } from './events/bus';

export * from './domain/entities/Room';
export * from './domain/entities/RoomMember';
export * from './domain/entities/Message';
export * from './domain/entities/Reaction';
export * from './domain/entities/Presence';

export * from './ports/storage';
export * from './ports/realtime';
export * from './ports/search';
export * from './ports/media';
export * from './ports/notifications';
export * from './domain/policy/CommunicationPolicy';
export * from './config';

export interface AlternateCommunicationModule {
  useCases: ReturnType<typeof createUseCases>;
  createRestRouter: (factory: RestRouterFactory) => any;
  eventBus: ReturnType<typeof createEventBus>;
}

export function createAlternateCommunicationModule(
  options: AlternateCommunicationOptions
): AlternateCommunicationModule {
  const eventBus = createEventBus(options.realtime);
  const useCases = createUseCases(options, eventBus);

  return {
    useCases,
    createRestRouter: (factory: RestRouterFactory) =>
      createRestRouter(factory, useCases, options.policy),
    eventBus
  };
}
