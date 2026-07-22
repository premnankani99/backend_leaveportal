const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/id\s+String\s+@id @default\(uuid\(\)\)/g, 'id Int @id @default(autoincrement())');
schema = schema.replace(/employee_id\s+String/g, 'employee_id Int');
schema = schema.replace(/department_id\s+String\?/g, 'department_id Int?');
schema = schema.replace(/head_id\s+String\?/g, 'head_id Int?');
schema = schema.replace(/approved_by\s+String\?/g, 'approved_by Int?');
schema = schema.replace(/actor_id\s+String\?/g, 'actor_id Int?');
schema = schema.replace(/target_id\s+String/g, 'target_id Int');
schema = schema.replace(/employeeId\s+String/g, 'employeeId Int');
schema = schema.replace(/grantedBy\s+String\?/g, 'grantedBy Int?');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Updated schema.prisma');
