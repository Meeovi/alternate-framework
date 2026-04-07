export function createLogger(level = 'info') {
    const levels = ['debug', 'info', 'warn', 'error'];
    function shouldLog(target) {
        return levels.indexOf(target) >= levels.indexOf(level);
    }
    return {
        level,
        debug(message, meta) {
            if (!shouldLog('debug'))
                return;
            console.debug(`[M Framework][debug] ${message}`, meta ?? '');
        },
        info(message, meta) {
            if (!shouldLog('info'))
                return;
            console.info(`[M Framework][info] ${message}`, meta ?? '');
        },
        warn(message, meta) {
            if (!shouldLog('warn'))
                return;
            console.warn(`[M Framework][warn] ${message}`, meta ?? '');
        },
        error(message, meta) {
            if (!shouldLog('error'))
                return;
            console.error(`[M Framework][error] ${message}`, meta ?? '');
        }
    };
}
