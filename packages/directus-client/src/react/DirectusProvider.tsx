import React, { createContext } from 'react';
import type { MeeoviDirectusClient } from '../client/createClient';

export const DirectusContext = createContext<MeeoviDirectusClient<any> | null>(null);

export function DirectusProvider({
  client,
  children
}: {
  client: MeeoviDirectusClient<any>;
  children: React.ReactNode;
}) {
  return (
    <DirectusContext.Provider value={client}>
      {children}
    </DirectusContext.Provider>
  );
}
