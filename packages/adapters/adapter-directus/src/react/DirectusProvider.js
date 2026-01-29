import React, { createContext } from 'react';
export const DirectusContext = createContext(null);
export function DirectusProvider({ client, children }) {
    return (<DirectusContext.Provider value={client}>
      {children}
    </DirectusContext.Provider>);
}
