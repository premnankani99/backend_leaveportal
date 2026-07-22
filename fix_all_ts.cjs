const fs = require('fs');

let admin = fs.readFileSync('controllers/admin.ts', 'utf8');
admin = admin.replace(/id: req\.params\.id/g, 'id: Number(req.params.id)');
admin = admin.replace(/employeeId: req\.params\.id/g, 'employeeId: Number(req.params.id)');
admin = admin.replace(/where: { id }/g, 'where: { id: Number(id) }');
fs.writeFileSync('controllers/admin.ts', admin);

let holidays = fs.readFileSync('controllers/holidays.ts', 'utf8');
holidays = holidays.replace(/id: req\.params\.id/g, 'id: Number(req.params.id)');
fs.writeFileSync('controllers/holidays.ts', holidays);

let leave = fs.readFileSync('services/leaveService.ts', 'utf8');
leave = leave.replace(/employee_id: string/g, 'employee_id: number');
leave = leave.replace(/calculateLeaveType\(inProbation, employee_id,/g, 'calculateLeaveType(inProbation, String(employee_id),');
fs.writeFileSync('services/leaveService.ts', leave);

let leaves = fs.readFileSync('controllers/leaves.ts', 'utf8');
leaves = leaves.replace(/req\.user\.id/g, 'Number(req.user.id)');
leaves = leaves.replace(/req\.params\.id/g, 'Number(req.params.id)');
leaves = leaves.replace(/req\.params\.employeeId/g, 'Number(req.params.employeeId)');
leaves = leaves.replace(/Number\(Number\(/g, 'Number(');
leaves = leaves.replace(/String\(Number\(/g, 'String(');
fs.writeFileSync('controllers/leaves.ts', leaves);

let comp = fs.readFileSync('services/compOffService.ts', 'utf8');
comp = comp.replace(/employee_id: string/g, 'employee_id: number');
comp = comp.replace(/admin_id: string/g, 'admin_id: number');
comp = comp.replace(/id: string/g, 'id: number');
comp = comp.replace(/String\(employee_id\)/g, 'Number(employee_id)');
fs.writeFileSync('services/compOffService.ts', comp);

let test = fs.readFileSync('test_apply.ts', 'utf8');
test = test.replace(/employee_id: '8'/g, 'employee_id: 8');
fs.writeFileSync('test_apply.ts', test);

console.log("Fixed all TS errors");
