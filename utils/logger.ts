import fs from 'fs';
import path from 'path';

// Environment flag check
let logEnabled = process.env.ENABLE_LOGS !== 'false';

const logDir = path.join(process.cwd(), 'logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Generate hourly log file path
const getLogFilePath = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    
    return path.join(logDir, `log-${year}-${month}-${day}-${hour}.log`);
};

// Safely format log messages
const formatMessage = (level: string, args: any[]): string => {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => {
        if (typeof arg === 'object') {
            if (arg instanceof Error) {
                return arg.stack || arg.message;
            }
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return '[Unserializable Object]';
            }
        }
        return String(arg);
    }).join(' ');
    
    return `[${timestamp}] [${level}] ${formattedArgs}`;
};

// Append string to file
const writeToFile = (message: string) => {
    if (!logEnabled) return;
    try {
        const filePath = getLogFilePath();
        fs.appendFileSync(filePath, message + '\n', 'utf8');
    } catch (err) {
        // Fallback if writing fails, avoid recursive loops
        process.stdout.write(`Failed to write to log file: ${err}\n`);
    }
};

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Override global console methods
console.log = (...args: any[]) => {
    const msg = formatMessage('INFO', args);
    writeToFile(msg);
    originalConsoleLog.apply(console, args);
};

console.warn = (...args: any[]) => {
    const msg = formatMessage('WARN', args);
    writeToFile(msg);
    originalConsoleWarn.apply(console, args);
};

console.error = (...args: any[]) => {
    const msg = formatMessage('ERROR', args);
    writeToFile(msg);
    originalConsoleError.apply(console, args);
};

// Exported logger object
export const logger = {
    info: (...args: any[]) => {
        const msg = formatMessage('INFO', args);
        writeToFile(msg);
        originalConsoleLog.apply(console, args);
    },
    warn: (...args: any[]) => {
        const msg = formatMessage('WARN', args);
        writeToFile(msg);
        originalConsoleWarn.apply(console, args);
    },
    error: (...args: any[]) => {
        const msg = formatMessage('ERROR', args);
        writeToFile(msg);
        originalConsoleError.apply(console, args);
    },
    setLogEnabled: (enabled: boolean) => {
        logEnabled = enabled;
    },
    isLogEnabled: () => logEnabled
};
