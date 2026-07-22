const fs = require('fs');

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

let leavesContent = fs.readFileSync('controllers/leaves.ts', 'utf8');
leavesContent = replaceAll(leavesContent, 'req.user.id, leave_type', 'Number(req.user.id), leave_type');
leavesContent = replaceAll(leavesContent, 'employee_id, leave_type', 'Number(employee_id), leave_type');
// fix the destructuring issue!
leavesContent = replaceAll(leavesContent, 'const { Number(employee_id), leave_type', 'const { employee_id, leave_type');
// rest is same
leavesContent = replaceAll(leavesContent, 'LeaveService.processLeaveActionService(String(req.params.id)', 'LeaveService.processLeaveActionService(Number(req.params.id)');
leavesContent = replaceAll(leavesContent, 'LeaveService.withdrawLeaveService(String(req.params.id)', 'LeaveService.withdrawLeaveService(Number(req.params.id)');
leavesContent = replaceAll(leavesContent, 'LeaveService.fetchEmployeeLeavesService(String(req.params.employeeId))', 'LeaveService.fetchEmployeeLeavesService(Number(req.params.employeeId))');
leavesContent = replaceAll(leavesContent, 'CompOffService.requestCompOffService(req.user.id,', 'CompOffService.requestCompOffService(Number(req.user.id),');
leavesContent = replaceAll(leavesContent, 'CompOffService.actionCompOffService(String(req.params.id), req.user.id,', 'CompOffService.actionCompOffService(Number(req.params.id), Number(req.user.id),');
leavesContent = replaceAll(leavesContent, 'CompOffService.fetchMyCompOffsService(req.user.id)', 'CompOffService.fetchMyCompOffsService(Number(req.user.id))');
fs.writeFileSync('controllers/leaves.ts', leavesContent);

console.log("Safe TS fixes applied!");
