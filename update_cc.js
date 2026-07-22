const fs = require('fs');

let content = fs.readFileSync('services/leaveHelper.ts', 'utf8');

const oldSendLeaveEmails = `    if (targetEmails.length > 0) {
        sendEmail({
            to: targetEmails, subject: 'New Leave Request', text: \`Employee \${profile.full_name} applied for \${durationText} of leave.\`,
            html: leaveAppliedAdminTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to admin/managers:", err));
    }`;

const newSendLeaveEmails = `    if (targetEmails.length > 0) {
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = targetEmails !== adminAndHrEmails ? adminAndHrEmails : [];
        
        sendEmail({
            to: targetEmails,
            cc: ccEmails,
            subject: 'New Leave Request',
            text: \`Employee \${profile.full_name} applied for \${durationText} of leave.\`,
            html: leaveAppliedAdminTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to admin/managers:", err));
    }`;

content = content.replace(oldSendLeaveEmails, newSendLeaveEmails);

const oldWithdrawal = `    if (targetEmails.length > 0 && employee) {
        sendEmail({
            to: targetEmails, subject: 'Leave Withdrawal Request', text: \`Withdrawal request from \${employee.full_name}\`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        }).catch(err => console.error("Failed to send withdrawal email:", err));
    }`;

const newWithdrawal = `    if (targetEmails.length > 0 && employee) {
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = targetEmails !== adminAndHrEmails ? adminAndHrEmails : [];
        
        sendEmail({
            to: targetEmails,
            cc: ccEmails,
            subject: 'Leave Withdrawal Request',
            text: \`Withdrawal request from \${employee.full_name}\`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        }).catch(err => console.error("Failed to send withdrawal email:", err));
    }`;

content = content.replace(oldWithdrawal, newWithdrawal);

fs.writeFileSync('services/leaveHelper.ts', content);
console.log("Updated CC logic in leaveHelper.ts");
