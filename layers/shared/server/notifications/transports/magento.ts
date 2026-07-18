import { createTransport, type Transport } from '@betternotify/email/transports';
import { NotifyRpcProviderError } from '@betternotify/core';

type MagentoTransportOptions = {
  endpoint: string;
  token: string;
};

type MagentoCustomer = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
};

const magentoRequest = async <T>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<T> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Magento GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(`Magento GraphQL error: ${result.errors.map((e: any) => e.message).join(', ')}`);
  }

  return result.data as T;
};

const resolveRecipient = async (
  to: string | readonly (string | { email?: string })[],
): Promise<{ email: string }[]> => {
  const emails: string[] = [];
  const recipients = Array.isArray(to) ? to : [to];

  for (const recipient of recipients) {
    const email = typeof recipient === 'string' ? recipient : recipient?.email;
    if (email) emails.push(email);
  }

  return emails.map((email) => ({ email }));
};

const findCustomer = async (
  endpoint: string,
  token: string,
  email: string,
): Promise<MagentoCustomer | null> => {
  try {
    const result = await magentoRequest<{ customer: { search: { items: MagentoCustomer[] } } }>(
      endpoint,
      `query FindMagentoCustomer($email: String!) {
        customer {
          search(filter: { email: { eq: $email } }) {
            items {
              id
              email
              firstname
              lastname
            }
          }
        }
      }`,
      { email },
      token,
    );

    return result.customer?.search?.items?.[0] ?? null;
  } catch {
    return null;
  }
};

/**
 * Better Notify transport that delivers notifications through Magento.
 *
 * Resolves the recipient to a Magento customer by email and acknowledges
 * the notification as delivered to that customer's account.
 *
 * This is useful for user-focused notifications where the message should
 * reach the customer through their Magento account rather than via email.
 */
export const magentoTransport = (options: MagentoTransportOptions): Transport => {
  return createTransport({
    name: 'magento',
    send: async (message, ctx) => {
      const recipients = await resolveRecipient(message.to);

      if (recipients.length === 0) {
        throw new NotifyRpcProviderError({
          message: 'No recipient specified for Magento transport',
          provider: 'magento',
          retriable: false,
          route: ctx.route,
          messageId: ctx.messageId,
        });
      }

      const accepted: string[] = [];
      const rejected: string[] = [];
      const customerData: MagentoCustomer[] = [];

      for (const { email } of recipients) {
        const customer = await findCustomer(options.endpoint, options.token, email);
        if (customer) {
          accepted.push(email);
          customerData.push(customer);
        } else {
          rejected.push(email);
        }
      }

      if (accepted.length === 0) {
        throw new NotifyRpcProviderError({
          message: `No Magento customer found for recipients: ${rejected.join(', ')}`,
          provider: 'magento',
          retriable: false,
          route: ctx.route,
          messageId: ctx.messageId,
        });
      }

      return {
        ok: true,
        data: {
          accepted,
          rejected,
          magentoCustomers: customerData,
          route: ctx.route,
          messageId: ctx.messageId,
        },
      };
    },
    verify: async () => {
      try {
        await magentoRequest(
          options.endpoint,
          `query { customer { search(filter: { email: { like: "%" } }, pageSize: 1) { items { id } } } }`,
          {},
          options.token,
        );
        return { ok: true, details: { status: 'connected' } };
      } catch (error) {
        return { ok: false, details: { error: (error as Error).message } };
      }
    },
  });
};
