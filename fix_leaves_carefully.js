const fs = require('fs');

let leavesContent = fs.readFileSync('controllers/leaves.ts', 'utf8');

// Replace `req.user.id` when passed to services which expect a number.
leavesContent = leavesContent.replace(/applyNewLeaveService\(req\.user\.id,/g, 'applyNewLeaveService(Number(req.user.id),');
leavesContent = leavesContent.replace(/fetchEmployeeLeavesService\(req\.user\.id\)/g, 'fetchEmployeeLeavesService(Number(req.user.id))');
leavesContent = leavesContent.replace(/processLeaveActionService\(req\.params\.id/g, 'processLeaveActionService(Number(req.params.id)');
leavesContent = leavesContent.replace(/withdrawLeaveService\(req\.params\.id/g, 'withdrawLeaveService(Number(req.params.id)');

fs.writeFileSync('controllers/leaves.ts', leavesContent);

let leaveService = fs.readFileSync('services/leaveService.ts', 'utf8');

leaveService = leaveService.replace(/employee_id: string/g, 'employee_id: number');
leaveService = leaveService.replace(/id: string/g, 'id: number');
leaveService = leaveService.replace(/employee_id: employee_id/g, 'employee_id: Number(employee_id)');
leaveService = leaveService.replace(/id: id/g, 'id: Number(id)');

// the most important fix for the email condition
const target = `    if (leave.status === 'approved') {
        await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    }
    return { message, updatedLeave };
};`;
if (!leaveService.includes(target)) {
    const oldTarget = `    await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    return { message, updatedLeave };
};`;
    leaveService = leaveService.replace(oldTarget, target);
}

fs.writeFileSync('services/leaveService.ts', leaveService);
