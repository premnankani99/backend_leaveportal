const fs = require('fs');

let leavesContent = fs.readFileSync('controllers/leaves.ts', 'utf8');

leavesContent = leavesContent.replace(/req\.user\.id,/g, 'Number(req.user.id),');
leavesContent = leavesContent.replace(/req\.params\.id/g, 'Number(req.params.id)');
leavesContent = leavesContent.replace(/employee_id, leave_type/g, 'Number(employee_id), leave_type');
leavesContent = leavesContent.replace(/Number\(Number\(/g, 'Number(');
leavesContent = leavesContent.replace(/\)\)/g, '))'); // clean up

fs.writeFileSync('controllers/leaves.ts', leavesContent);

let leaveService = fs.readFileSync('services/leaveService.ts', 'utf8');
leaveService = leaveService.replace(/String\(employee_id\)/g, 'String(Number(employee_id))');
fs.writeFileSync('services/leaveService.ts', leaveService);
