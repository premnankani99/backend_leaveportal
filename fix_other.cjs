const fs = require('fs');

function fixAdmin(file) {
    let text = fs.readFileSync(file, 'utf8');
    text = text.replace(/id: req.params.id/g, 'id: Number(req.params.id)');
    text = text.replace(/employeeId: req.params.id/g, 'employeeId: Number(req.params.id)');
    text = text.replace(/id: String\(req\.params\.id\)/g, 'id: Number(req.params.id)');
    fs.writeFileSync(file, text);
}

fixAdmin('controllers/admin.ts');
fixAdmin('controllers/holidays.ts');

let leave = fs.readFileSync('services/leaveService.ts', 'utf8');
leave = leave.replace(/Number\(profile\.date_of_joining\)/g, 'String(profile.date_of_joining)');
leave = leave.replace(/employee_id: string/g, 'employee_id: number');
fs.writeFileSync('services/leaveService.ts', leave);

let testFile = fs.readFileSync( 'utf8');
testFile = testFile.replace(/employee_id: '8'/g, 'employee_id: 8');
testFile = testFile.replace(/employee_id: "8"/g, 'employee_id: 8');
fs.writeFileSync( testFile);

console.log("Fixed others");
