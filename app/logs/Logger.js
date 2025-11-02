import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
    static LOG_DIR = path.join(__dirname, '../../logs');
    static LOG_FILE = path.join(this.LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);
    static ERROR_FILE = path.join(this.LOG_DIR, `error-${new Date().toISOString().split('T')[0]}.log`);

    static _ensureLogDir() {
        if (!fs.existsSync(this.LOG_DIR)) {
            fs.mkdirSync(this.LOG_DIR, { recursive: true });
        }
    }

    static _writeToFile(file, message) {
        try {
            this._ensureLogDir();
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${message}\n`;
            fs.appendFileSync(file, logMessage);
        } catch (error) {
            console.error('Failed to write log to file:', error);
        }
    }

    static _formatMessage(level, message, data) {
        const dataStr = data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : '';
        return `[${level}] ${message}${dataStr ? ': ' + dataStr : ''}`;
    }

    static error(message, error) {
        const errorStr = error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error);
        const formattedMsg = this._formatMessage('ERROR', message, errorStr);
        
        console.error(formattedMsg);
        this._writeToFile(this.ERROR_FILE, formattedMsg);
        this._writeToFile(this.LOG_FILE, formattedMsg);
    }

    static info(message, data) {
        const formattedMsg = this._formatMessage('INFO', message, data);
        console.log(formattedMsg);
        this._writeToFile(this.LOG_FILE, formattedMsg);
    }

    static warn(message, data) {
        const formattedMsg = this._formatMessage('WARN', message, data);
        console.warn(formattedMsg);
        this._writeToFile(this.LOG_FILE, formattedMsg);
    }

    static debug(message, data) {
        const formattedMsg = this._formatMessage('DEBUG', message, data);
        console.debug(formattedMsg);
        if (process.env.NODE_ENV === 'development') {
            this._writeToFile(this.LOG_FILE, formattedMsg);
        }
    }

    static database(message, data) {
        const formattedMsg = this._formatMessage('DATABASE', message, data);
        console.log(formattedMsg);
        this._writeToFile(this.LOG_FILE, formattedMsg);
    }

    static api(method, path, status, duration) {
        const formattedMsg = `[API] ${method} ${path} - Status: ${status} - Duration: ${duration}ms`;
        console.log(formattedMsg);
        this._writeToFile(this.LOG_FILE, formattedMsg);
    }
}

export default Logger;
