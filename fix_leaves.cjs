const fs = require('fs');
let leaves = fs.readFileSync('controllers/leaves.ts', 'utf8');

// The original controllers/leaves.ts might have req.user.id and req.params.id passed directly.
// We need to replace them with Number(req.user.id) and Number(req.params.id) ONLY in the arguments of service calls.
// Since it's a bit complex with regex, we can just look for the specific service calls that complain.
// Based on the TS errors:
// controllers/leaves.ts(19,13): Argument of type 'string' is not assignable to parameter of type 'number'.
// ...

leaves = leaves.replace(/req\.user\.id/g, 'Number(req.user.id)');
leaves = leaves.replace(/req\.params\.id/g, 'Number(req.params.id)');
leaves = leaves.replace(/req\.params\.employeeId/g, 'Number(req.params.employeeId)');

// If there was already a Number() cast, we might end up with Number(Number(req.user.id)) which is fine, but String(req.user.id) becomes String(Number(req.user.id)) which fails.
// Let's strip out String() wrappers around Number() wrappers.
leaves = leaves.replace(/String\(Number\(([^)]+)\)\)/g, 'Number($1)');
leaves = leaves.replace(/String\((req\.params\.\w+)\)/g, 'Number($1)');
leaves = leaves.replace(/String\((req\.user\.\w+)\)/g, 'Number($1)');

fs.writeFileSync('controllers/leaves.ts', leaves);
console.log("Fixed controllers/leaves.ts");
