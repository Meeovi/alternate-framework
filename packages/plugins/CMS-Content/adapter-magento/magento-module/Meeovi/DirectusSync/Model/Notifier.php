<?php
declare(strict_types=1);

namespace Meeovi\DirectusSync\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Encryption\EncryptorInterface;
use Magento\Framework\HTTP\Client\CurlFactory;
use Magento\Framework\Serialize\Serializer\Json;
use Psr\Log\LoggerInterface;

/**
 * Collects which sections changed during this request (or CLI run) and
 * pings Directus once, at the end: POST {url}/commerce/mirror/notify with
 * {"sections": [...]}. Shared (one per request), so an order placement that
 * saves the order several times still sends a single ping.
 *
 * Never throws: a slow or unreachable Directus is logged and the save that
 * caused it is unaffected. Directus's scheduled Flows catch anything missed.
 */
class Notifier
{
    public const XML_ENABLED = 'meeovi_directus_sync/general/enabled';
    public const XML_URL = 'meeovi_directus_sync/general/url';
    public const XML_SECRET = 'meeovi_directus_sync/general/secret';
    public const XML_TIMEOUT = 'meeovi_directus_sync/general/timeout';

    public const SECTIONS = ['orders', 'customers', 'products', 'categories'];

    /** @var array<string, true> */
    private array $pending = [];

    private bool $flushRegistered = false;

    public function __construct(
        private readonly ScopeConfigInterface $config,
        private readonly EncryptorInterface $encryptor,
        private readonly CurlFactory $curlFactory,
        private readonly Json $json,
        private readonly LoggerInterface $logger
    ) {
    }

    public function queue(string $section): void
    {
        if (!in_array($section, self::SECTIONS, true) || !$this->config->isSetFlag(self::XML_ENABLED)) {
            return;
        }
        $this->pending[$section] = true;
        if (!$this->flushRegistered) {
            $this->flushRegistered = true;
            register_shutdown_function([$this, 'flush']);
        }
    }

    /**
     * The shared secret. Saved in the admin or with config:set it's encrypted
     * ("<key>:<version>:…"); set in app/etc/env.php (config:sensitive:set,
     * --lock-env) it's plain text, which decrypt() would turn into garbage.
     */
    private function secret(): string
    {
        $stored = trim((string)$this->config->getValue(self::XML_SECRET));
        if ($stored === '') {
            return '';
        }
        return preg_match('/^\d+:\d+:/', $stored) ? trim((string)$this->encryptor->decrypt($stored)) : $stored;
    }

    /**
     * Sends the pending ping. Public for register_shutdown_function.
     */
    public function flush(): void
    {
        if (!$this->pending) {
            return;
        }
        $sections = array_keys($this->pending);
        $this->pending = [];

        try {
            $url = rtrim(trim((string)$this->config->getValue(self::XML_URL)), '/');
            if ($url === '') {
                $this->logger->warning('[Meeovi_DirectusSync] enabled but no Directus URL is set');
                return;
            }
            $timeout = (int)$this->config->getValue(self::XML_TIMEOUT);
            $curl = $this->curlFactory->create();
            $curl->setTimeout(max(1, min(10, $timeout ?: 2)));
            $curl->addHeader('Content-Type', 'application/json');
            $secret = $this->secret();
            if ($secret !== '') {
                $curl->addHeader('X-Mageos-Notify-Secret', $secret);
            }
            $curl->post($url . '/commerce/mirror/notify', $this->json->serialize(['sections' => $sections]));
            if ($curl->getStatus() !== 202) {
                $this->logger->warning(sprintf(
                    '[Meeovi_DirectusSync] Directus answered %d to the %s ping: %s',
                    $curl->getStatus(),
                    implode(',', $sections),
                    substr((string)$curl->getBody(), 0, 300)
                ));
            }
        } catch (\Throwable $e) {
            $this->logger->warning('[Meeovi_DirectusSync] ping failed: ' . $e->getMessage());
        }
    }
}
