const fs = require('fs');

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

let leavesContent = fs.readFileSync('controllers/leaves.ts', 'utf8');
leavesContent = replaceAll(leavesContent, 'applyNewLeaveService(req.user.id,', 'applyNewLeaveService(Number(req.user.id),');
leavesContent = replaceAll(leavesContent, 'fetchEmployeeLeavesService(req.user.id)', 'fetchEmployeeLeavesService(Number(req.user.id))');
leavesContent = replaceAll(leavesContent, 'processLeaveActionService(req.params.id,', 'processLeaveActionService(Number(req.params.id),');
leavesContent = replaceAll(leavesContent, 'withdrawLeaveService(req.params.id,', 'withdrawLeaveService(Number(req.params.id),');
fs.writeFileSync('controllers/leaves.ts', leavesContent);

let leaveService = fs.readFileSync('services/leaveService.ts', 'utf8');
leaveService = replaceAll(leaveService, 'employee_id: string', 'employee_id: number');
leaveService = replaceAll(leaveService, 'id: string', 'id: number');
leaveService = replaceAll(leaveService, 'employee_id: employee_id', 'employee_id: Number(employee_id)');
leaveService = replaceAll(leaveService, 'id: id', 'id: Number(id)');
leaveService = replaceAll(leaveService, 'String(employee_id)', 'String(Number(employee_id))');

const oldEmailCall = `    await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    return { message, updatedLeave };
};`;

const newEmailCall = `    if (leave.status === 'approved') {
        await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    }
    return { message, updatedLeave };
};`;
leaveService = replaceAll(leaveService, oldEmailCall, newEmailCall);

fs.writeFileSync('services/leaveService.ts', leaveService);

let adminContent = fs.readFileSync('controllers/admin.ts', 'utf8');
adminContent = replaceAll(adminContent, '.toDate()', '');
fs.writeFileSync('controllers/admin.ts', adminContent);

console.log("Done fixing!");
