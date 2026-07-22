const fs = require('fs');

// 1. Fix leaveHelper.ts
let leaveHelper = fs.readFileSync('services/leaveHelper.ts', 'utf8');

if (!leaveHelper.includes('getAdminAndHrEmails')) {
    leaveHelper = leaveHelper.replace(
        "import { sendEmail, MAIN_ADMIN_EMAILS } from '../utils/emailService';",
        "import { sendEmail, getAdminAndHrEmails } from '../utils/emailService';"
    );
}

const oldSendLeaveEmails = `    let targetEmails: string[] = [];
    if (profile.managers && profile.managers.length > 0) {
        targetEmails = profile.managers.map((m: any) => m.email).filter(Boolean);
    }
    
    if (targetEmails.length === 0) {
        targetEmails = MAIN_ADMIN_EMAILS;
    }

    if (targetEmails.length > 0) {
        sendEmail({
            to: targetEmails, subject: 'New Leave Request', text: \`Employee \${profile.full_name} applied for \${durationText} of leave.\`,
            html: leaveAppliedAdminTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to admin/managers:", err));
    }`;

const newSendLeaveEmails = `    let targetEmails: string[] = [];
    if (profile.managers && profile.managers.length > 0) {
        targetEmails = profile.managers.map((m: any) => m.email).filter(Boolean);
    }
    
    const adminAndHrEmails = await getAdminAndHrEmails();

    if (targetEmails.length === 0) {
        targetEmails = adminAndHrEmails;
    }

    if (targetEmails.length > 0) {
        const ccEmails = adminAndHrEmails.filter(email => !targetEmails.includes(email));
        
        sendEmail({
            to: targetEmails,
            cc: ccEmails,
            subject: 'New Leave Request',
            text: \`Employee \${profile.full_name} applied for \${durationText} of leave.\`,
            html: leaveAppliedAdminTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to admin/managers:", err));
    }`;

leaveHelper = leaveHelper.replace(oldSendLeaveEmails, newSendLeaveEmails);

const oldWithdrawal = `    let targetEmails: string[] = [];
    if (employee && employee.managers && employee.managers.length > 0) {
        targetEmails = employee.managers.map((m: any) => m.email).filter(Boolean);
    }
    
    if (targetEmails.length === 0) {
        targetEmails = MAIN_ADMIN_EMAILS;
    }

    if (targetEmails.length > 0 && employee) {
        sendEmail({
            to: targetEmails, subject: 'Leave Withdrawal Request', text: \`Withdrawal request from \${employee.full_name}\`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        }).catch(err => console.error("Failed to send withdrawal email:", err));
    }`;

const newWithdrawal = `    let targetEmails: string[] = [];
    if (employee && employee.managers && employee.managers.length > 0) {
        targetEmails = employee.managers.map((m: any) => m.email).filter(Boolean);
    }
    
    const adminAndHrEmails = await getAdminAndHrEmails();

    if (targetEmails.length === 0) {
        targetEmails = adminAndHrEmails;
    }

    if (targetEmails.length > 0 && employee) {
        const ccEmails = adminAndHrEmails.filter(email => !targetEmails.includes(email));
        
        sendEmail({
            to: targetEmails,
            cc: ccEmails,
            subject: 'Leave Withdrawal Request',
            text: \`Withdrawal request from \${employee.full_name}\`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        }).catch(err => console.error("Failed to send withdrawal email:", err));
    }`;

leaveHelper = leaveHelper.replace(oldWithdrawal, newWithdrawal);

fs.writeFileSync('services/leaveHelper.ts', leaveHelper);


// 2. Fix compOffService.ts CC logic
let compOffContent = fs.readFileSync('services/compOffService.ts', 'utf8');

const oldCompOffCC = `const ccEmails = targetEmails !== adminAndHrEmails ? adminAndHrEmails : [];`;
const newCompOffCC = `const ccEmails = adminAndHrEmails.filter(email => !targetEmails.includes(email));`;

compOffContent = compOffContent.replace(oldCompOffCC, newCompOffCC);

fs.writeFileSync('services/compOffService.ts', compOffContent);

console.log("Fixed CC duplicates in leaveHelper and compOffService!");
