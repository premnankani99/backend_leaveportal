const fs = require('fs');

let leavesContent = fs.readFileSync('controllers/leaves.ts', 'utf8');
leavesContent = leavesContent.replace(/req\.user\.id/g, 'Number(req.user.id)');
leavesContent = leavesContent.replace(/Number\(Number\(/g, 'Number(');
fs.writeFileSync('controllers/leaves.ts', leavesContent);

let adminContent = fs.readFileSync('controllers/admin.ts', 'utf8');
adminContent = adminContent.replace(/\.toDate\(\)/g, '');
fs.writeFileSync('controllers/admin.ts', adminContent);

let leaveService = fs.readFileSync('services/leaveService.ts', 'utf8');
leaveService = leaveService.replace(/employee_id: string/g, 'employee_id: number');
leaveService = leaveService.replace(/id: string/g, 'id: number');
leaveService = leaveService.replace(/employee_id: Number\(employee_id\)/g, 'employee_id: Number(employee_id)');
fs.writeFileSync('services/leaveService.ts', leaveService);
