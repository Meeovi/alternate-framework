
export interface Session {
  id: string;
  date_created: string;
}

export function ensureSession(getCookie: (name: string) => any, setCookie: (name: string, value: string) => void, generateId: () => string) {
  const session = getCookie('session');

  if (!session) {
    const newSession: Session = {
      id: generateId(),
      date_created: new Date().toISOString(),
    };

    setCookie('session', JSON.stringify(newSession));
  }
}
