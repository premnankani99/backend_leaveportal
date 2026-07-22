const fs = require('fs');

let rbacContent = fs.readFileSync('middleware/rbac.ts', 'utf8');

// Ensure 'leaves:self' is given to admin and hr so they can hit /my-leaves without 403
rbacContent = rbacContent.replace(
`  admin: [
    'leaves:read', 
    'leaves:write', 
    'employees:read', 
    'employees:write', 
    'announcements:write',
    'holidays:write'
  ],`,
`  admin: [
    'leaves:read', 
    'leaves:write', 
    'leaves:self',
    'employees:read', 
    'employees:write', 
    'announcements:write',
    'holidays:write'
  ],`
);

rbacContent = rbacContent.replace(
`  hr: [
    'leaves:read', 
    'leaves:write',
    'employees:read',
    'employees:write',
    'holidays:write'
  ],`,
`  hr: [
    'leaves:read', 
    'leaves:write',
    'leaves:self',
    'employees:read',
    'employees:write',
    'holidays:write'
  ],`
);

fs.writeFileSync('middleware/rbac.ts', rbacContent, 'utf8');
console.log('Fixed RBAC for admin/hr leaves:self');
