const fs = require('fs');

function fixControllerFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/req\.user\.id/g, 'Number(req.user.id)');
    content = content.replace(/req\.params\.employeeId/g, 'Number(req.params.employeeId)');
    content = content.replace(/req\.params\.id/g, 'Number(req.params.id)');
    // Fix double casting if any
    content = content.replace(/Number\(Number\((.*?)\)\)/g, 'Number($1)');
    content = content.replace(/String\((.*?)\)/g, '$1'); // Remove String() casting
    
    // Some logger.error missing
    content = content.replace(/catch \(_error: any\) {/g, 'catch (_error: any) {\n        logger.error("[Backend] Error caught in " + __filename);');
    
    fs.writeFileSync(filePath, content);
}

function fixServiceFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/where: \{ employee_id \}/g, 'where: { employee_id: Number(employee_id) }');
    content = content.replace(/where: \{ id \}/g, 'where: { id: Number(id) }');
    content = content.replace(/employeeId: employee_id/g, 'employeeId: Number(employee_id)');
    content = content.replace(/employeeId: Number\(Number\(employee_id\)\)/g, 'employeeId: Number(employee_id)');
    
    // For specific functions
    fs.writeFileSync(filePath, content);
}

fixControllerFile('controllers/leaves.ts');
fixControllerFile('controllers/admin.ts');
fixServiceFile('services/leaveService.ts');
fixServiceFile('services/compOffService.ts');

console.log("Fixed files.");
