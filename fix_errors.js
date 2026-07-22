const fs = require('fs');

// Fix leaveService.ts
let content = fs.readFileSync('services/leaveService.ts', 'utf8');
content = content.replace(/import logger from '\.\.\/utils\/logger';/g, "import { logger } from '../utils/logger';");
fs.writeFileSync('services/leaveService.ts', content);

// Fix compOffService.ts
content = fs.readFileSync('services/compOffService.ts', 'utf8');
content = content.replace(/import logger from '\.\.\/utils\/logger';/g, "import { logger } from '../utils/logger';");
fs.writeFileSync('services/compOffService.ts', content);

// Fix controllers/leaves.ts
content = fs.readFileSync('controllers/leaves.ts', 'utf8');
if (!content.includes('utils/logger')) {
    content = "import { logger } from '../utils/logger';\n" + content;
}
content = content.replace(/export const getAllLeaves = async \(_req: AuthRequest, res: Response\)/g, "export const getAllLeaves = async (req: AuthRequest, res: Response)");
content = content.replace(/export const getPendingCompOffRequests = async \(_req: AuthRequest, res: Response\)/g, "export const getPendingCompOffRequests = async (req: AuthRequest, res: Response)");
fs.writeFileSync('controllers/leaves.ts', content);

// Fix controllers/admin.ts
content = fs.readFileSync('controllers/admin.ts', 'utf8');
content = content.replace(/\.toDate\(\)/g, ""); // Remove .toDate()
fs.writeFileSync('controllers/admin.ts', content);

console.log("Fixed errors");
