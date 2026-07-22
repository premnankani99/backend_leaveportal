const fs = require('fs');

function replaceIds(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/employee_id: string/g, 'employee_id: number');
    content = content.replace(/admin_id: string/g, 'admin_id: number');
    content = content.replace(/id: string/g, 'id: number');
    content = content.replace(/String\(employee_id\)/g, 'Number(employee_id)');
    fs.writeFileSync(file, content);
}

replaceIds('services/leaveService.ts');
replaceIds('services/compOffService.ts');

let leaves = fs.readFileSync('controllers/leaves.ts', 'utf8');
leaves = leaves.replace(/req\.user\.id/g, 'Number(req.user.id)');
leaves = leaves.replace(/req\.params\.id/g, 'Number(req.params.id)');
leaves = leaves.replace(/req\.params\.employeeId/g, 'Number(req.params.employeeId)');
leaves = leaves.replace(/Number\(Number\(/g, 'Number(');
leaves = leaves.replace(/String\(Number\(/g, 'Number(');
fs.writeFileSync('controllers/leaves.ts', leaves);

console.log("Fixed IDs");
