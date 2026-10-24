<?php
declare(strict_types=1);

namespace Meeovi\DirectusSync\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Meeovi\DirectusSync\Model\Notifier;

/**
 * After a save/delete is committed: mark its section as changed. One class,
 * one virtual type per section (etc/di.xml).
 */
class QueueSection implements ObserverInterface
{
    public function __construct(
        private readonly Notifier $notifier,
        private readonly string $section = 'orders'
    ) {
    }

    public function execute(Observer $observer): void
    {
        $this->notifier->queue($this->section);
    }
}
