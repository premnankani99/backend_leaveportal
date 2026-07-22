const fs = require('fs');

let admin = fs.readFileSync('controllers/admin.ts', 'utf8');
admin = admin.replace(/String\(id\)/g, 'Number(id)');
admin = admin.replace(/String\(req\.params\.employeeId\)/g, 'Number(req.params.employeeId)');
admin = admin.replace(/where: { id }/g, 'where: { id: Number(id) }');
fs.writeFileSync('controllers/admin.ts', admin);

let hol = fs.readFileSync('controllers/holidays.ts', 'utf8');
hol = hol.replace(/String\(req\.params\.id\)/g, 'Number(req.params.id)');
fs.writeFileSync('controllers/holidays.ts', hol);

let leave = fs.readFileSync('services/leaveService.ts', 'utf8');
leave = leave.replace(/calculateLeaveType\(inProbation, employee_id,/g, 'calculateLeaveType(inProbation, String(employee_id),');
fs.writeFileSync('services/leaveService.ts', leave);

let leaves = fs.readFileSync('controllers/leaves.ts', 'utf8');
leaves = leaves.replace(/req\.user\.id/g, 'Number(req.user.id)');
leaves = leaves.replace(/req\.params\.id/g, 'Number(req.params.id)');
leaves = leaves.replace(/req\.params\.employeeId/g, 'Number(req.params.employeeId)');
leaves = leaves.replace(/Number\(Number\(/g, 'Number(');
fs.writeFileSync('controllers/leaves.ts', leaves);

let testFile = fs.readFileSync( 'utf8');
testFile = testFile.replace(/employee_id: '8'/g, 'employee_id: 8');
testFile = testFile.replace(/employee_id: "8"/g, 'employee_id: 8');
fs.writeFileSync( testFile);
