const fs = require('fs');

let content = fs.readFileSync('services/leaveHelper.ts', 'utf8');

const regex = /if \(targetEmails\.length > 0\) \{\s*sendEmail\(\{\s*to: targetEmails, subject: 'New Leave Request',/g;

const replacement = `if (targetEmails.length > 0) {
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = adminAndHrEmails.filter(email => !targetEmails.includes(email));

        sendEmail({
            to: targetEmails,
            cc: ccEmails,
            subject: 'New Leave Request',`;

content = content.replace(regex, replacement);

const regex2 = /if \(targetEmails\.length > 0 && employee\) \{\s*sendEmail\(\{\s*to: targetEmails, subject: 'Leave Withdrawal Request',/g;

const replacement2 = `if (targetEmails.length > 0 && employee) {
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = adminAndHrEmails.filter(email => !targetEmails.includes(email));

        sendEmail({
            to: targetEmails,
            cc: ccEmails,
            subject: 'Leave Withdrawal Request',`;

content = content.replace(regex2, replacement2);

fs.writeFileSync('services/leaveHelper.ts', content);
console.log("Updated CC arrays properly!");
