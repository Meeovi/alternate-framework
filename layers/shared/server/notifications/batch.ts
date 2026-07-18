import { consoleLogger } from '@betternotify/core/logger';
import { buildClient, makeRecipients } from './notify';

export const runBatch = async (): Promise<void> => {
  const mail = buildClient({
    logger: consoleLogger({ level: 'info' }),
  });

  // Dynamically generated recipients, each with a unique name + verify URL.
  const recipients = makeRecipients(5);
  // Keep one intentionally invalid URL so the batch demonstrates validation errors.
  recipients[2]!.verifyUrl = 'not-a-url';

  const startedAt = performance.now();

  const batchResult = await mail.welcome.batch(
    recipients.map((r) => ({
      to: r.email,
      input: { name: r.name, verifyUrl: r.verifyUrl },
    })),
    { interval: 250 },
  );

  const totalMs = performance.now() - startedAt;

  console.log(`Total wall time: ${totalMs.toFixed(0)}ms`);
  console.log(`Sent OK:         ${batchResult.okCount}`);
  console.log(`Errors:          ${batchResult.errorCount}`);
  console.log('---');

  for (const entry of batchResult.results) {
    const recipient = recipients[entry.index];
    if (entry.status === 'ok') {
      console.log(`  [${entry.index}] ok    → ${recipient?.email} (${entry.result.messageId})`);
    } else {
      console.log(
        `  [${entry.index}] error → ${recipient?.email} (${entry.error.code}: ${entry.error.message})`,
      );
    }
  }
};
