const fs = require('fs');

let code = fs.readFileSync('services/leaveHelper.ts', 'utf8');

// 1. sendLeaveEmails (Employee application)
code = code.replace(
    `    if (profile.email) {
        sendEmail({
            to: profile.email, subject: 'Leave Application Submitted', text: \`Your leave for \${durationText} is submitted.\`,
            html: leaveAppliedEmployeeTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to employee:", err));
    }`,
    `    if (profile.email) {
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = adminAndHrEmails.filter(email => email !== profile.email);
        sendEmail({
            to: profile.email,
            cc: ccEmails,
            subject: 'Leave Application Submitted', text: \`Your leave for \${durationText} is submitted.\`,
            html: leaveAppliedEmployeeTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to employee:", err));
    }`
);

// 2. sendStatusEmail
code = code.replace(
    `export const sendStatusEmail = async (leave: any, status: string, adminNote: string): Promise<void> => {
    if (leave.employee?.email) {
        sendEmail({
            to: leave.employee.email, subject: \`Leave Request \${status.toUpperCase()}\`, text: \`Your leave has been \${status}.\`,
            html: leaveStatusUpdateTemplate(leave.employee.full_name, leave.start_date.toDateString(), leave.end_date.toDateString(), status, adminNote || '')
        }).catch(err => console.error("Failed to send status email:", err));
    }
};`,
    `export const sendStatusEmail = async (leave: any, status: string, adminNote: string): Promise<void> => {
    if (leave.employee?.email) {
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = adminAndHrEmails.filter(email => email !== leave.employee.email);
        sendEmail({
            to: leave.employee.email,
            cc: ccEmails,
            subject: \`Leave Request \${status.toUpperCase()}\`, text: \`Your leave has been \${status}.\`,
            html: leaveStatusUpdateTemplate(leave.employee.full_name, leave.start_date.toDateString(), leave.end_date.toDateString(), status, adminNote || '')
        }).catch(err => console.error("Failed to send status email:", err));
    }
};`
);

fs.writeFileSync('services/leaveHelper.ts', code);
console.log("Updated leaveHelper.ts successfully");
