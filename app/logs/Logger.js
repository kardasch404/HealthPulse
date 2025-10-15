class Logger {
    static error(message, error) {
        console.error(`[ERROR] ${message}:`, error);
    }

    static info(message, data) {
        console.log(`[INFO] ${message}:`, data || '');
    }

    static warn(message, data) {
        console.warn(`[WARN] ${message}:`, data || '');
    }

    static debug(message, data) {
        console.debug(`[DEBUG] ${message}:`, data || '');
    }
}

export default Logger;
