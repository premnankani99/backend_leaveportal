const fs = require('fs');
const path = require('path');

const directories = ['controllers', 'services'];
const loggerImport = "import { logger } from '../utils/logger';\n";

function injectLogsInDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (!file.endsWith('.ts')) continue;
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if logger is already imported
        if (!content.includes("import { logger }")) {
            content = loggerImport + content;
        }

        // Regex to find exported const functions
        const exportRegex = /export const (\w+) = async \([^)]*\) (?:=>|:) [^{]*{/g;
        let modified = false;

        content = content.replace(exportRegex, (match, funcName) => {
            modified = true;
            return `${match}\n    logger.info("[Backend] Executing ${funcName} in ${file}");`;
        });

        // Add to catch blocks
        const catchRegex = /catch \([^)]+\) {/g;
        content = content.replace(catchRegex, (match) => {
            modified = true;
            return `${match}\n        logger.error("[Backend] Error caught in ${file}");`;
        });

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Injected logs into ${filePath}`);
        }
    }
}

directories.forEach(injectLogsInDirectory);
console.log("Backend log injection complete.");
