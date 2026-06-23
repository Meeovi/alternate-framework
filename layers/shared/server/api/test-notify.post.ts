// server/api/test-notify.post.ts
export default defineEventHandler(async (event) => {
  const nuxtApp = useNuxtApp();
  const dispatcher = nuxtApp.$notifyDispatcher;
  const addresses = nuxtApp.$notifyAddresses;

  await addresses.setUserAddresses({
    userId: 'user_1',
    addresses: [
      { channel: 'email', address: 'user@example.com' }
    ]
  });

  await dispatcher.dispatch({
    userId: 'user_1',
    templateKey: 'communication.new-message',
    data: {
      senderName: 'Alice',
      snippet: 'Hey, are you free later?'
    },
    channels: ['email']
  });

  return { ok: true };
});
