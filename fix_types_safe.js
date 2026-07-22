const fs = require('fs');

let content = fs.readFileSync('controllers/leaves.ts', 'utf8');

// Precise replacements
content = content.replace(
    'req.user.id, leave_type, new Date(start_date)',
    'Number(req.user.id), leave_type, new Date(start_date)'
);
content = content.replace(
    'LeaveService.fetchEmployeeLeavesService(req.user.id);',
    'LeaveService.fetchEmployeeLeavesService(Number(req.user.id));'
);
content = content.replace(
    'LeaveService.fetchAllLeavesService();',
    'LeaveService.fetchAllLeavesService(req.user);'
);
content = content.replace(
    'processLeaveActionService(String(req.params.id)',
    'processLeaveActionService(Number(req.params.id)'
);
content = content.replace(
    'withdrawLeaveService(String(req.params.id)',
    'withdrawLeaveService(Number(req.params.id)'
);
content = content.replace(
    'fetchEmployeeLeavesService(String(req.params.employeeId)',
    'fetchEmployeeLeavesService(Number(req.params.employeeId)'
);
content = content.replace(
    'CompOffService.requestCompOffService(req.user.id',
    'CompOffService.requestCompOffService(Number(req.user.id)'
);
content = content.replace(
    'CompOffService.fetchPendingCompOffsService()',
    'CompOffService.fetchPendingCompOffsService(req.user)'
);
content = content.replace(
    'CompOffService.actionCompOffService(String(req.params.id), req.user.id',
    'CompOffService.actionCompOffService(Number(req.params.id), Number(req.user.id)'
);
content = content.replace(
    'CompOffService.fetchMyCompOffsService(req.user.id)',
    'CompOffService.fetchMyCompOffsService(Number(req.user.id))'
);

// Add missing logger in catches
content = content.replace(/catch \(_error\) \{/g, 'catch (_error) {\n        logger.error("[Backend] Error caught in leaves.ts");');
content = content.replace(/catch \(_error: any\) \{/g, 'catch (_error: any) {\n        logger.error("[Backend] Error caught in leaves.ts");');
content = content.replace(/catch \(error\) \{/g, 'catch (error) {\n        logger.error("[Backend] Error caught in leaves.ts");');

fs.writeFileSync('controllers/leaves.ts', content);
console.log("Fixed controllers/leaves.ts");

// Same for admin.ts (where applicable)
let adminContent = fs.readFileSync('controllers/admin.ts', 'utf8');
adminContent = adminContent.replace(
    'fetchPendingCompOffsService()',
    'fetchPendingCompOffsService(req.user)'
);
fs.writeFileSync('controllers/admin.ts', adminContent);
console.log("Fixed controllers/admin.ts");
