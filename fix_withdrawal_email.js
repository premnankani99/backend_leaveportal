const fs = require('fs');
let content = fs.readFileSync('services/leaveService.ts', 'utf8');

const target = `    await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    return { message, updatedLeave };
};`;
const replacement = `    if (leave.status === 'approved') {
        await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    }
    return { message, updatedLeave };
};`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('services/leaveService.ts', content);
    console.log("Fixed leaveService.ts withdrawal email condition!");
} else {
    console.log("Could not find target string.");
}
