const fs = require('fs');

let content = fs.readFileSync('services/leaveHelper.ts', 'utf8');

const oldSendLeaveEmails = `    let targetEmails: string[] = [];
    if (profile.managers && profile.managers.length > 0) {
        targetEmails = profile.managers.map((m: any) => m.email).filter(Boolean);
    }
    
    if (targetEmails.length === 0) {
        targetEmails = await getAdminAndHrEmails();
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


const oldWithdraw = `    let targetEmails: string[] = [];
    if (employee && employee.managers && employee.managers.length > 0) {
        targetEmails = employee.managers.map((m: any) => m.email).filter(Boolean);
    }
    
    if (targetEmails.length === 0) {
        targetEmails = await getAdminAndHrEmails();
    }

    if (targetEmails.length > 0 && employee) {
        sendEmail({
            to: targetEmails, subject: 'Leave Withdrawal Request', text: \`Withdrawal request from \${employee.full_name}\`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        }).catch(err => console.error("Failed to send withdrawal email:", err));
    }`;

const newWithdraw = `    let targetEmails: string[] = [];
    if (employee && employee.managers && employee.managers.length > 0) {
        targetEmails = employee.managers.map((m: any) => m.email).filter(Boolean);
    }
    
    const adminAndHrEmails = await getAdminAndHrEmails();
    if (targetEmails.length === 0) {
        targetEmails = adminAndHrEmails;
    }

    if (targetEmails.length > 0 && employee) {
        const ccEmails = targetEmails !== adminAndHrEmails ? adminAndHrEmails : [];
        sendEmail({
            to: targetEmails, 
            cc: ccEmails,
            subject: 'Leave Withdrawal Request', 
            text: \`Withdrawal request from \${employee.full_name}\`,
            html: leaveWithdrawalAdminTemplate(employee.full_name, start.toDateString(), end.toDateString(), message)
        }).catch(err => console.error("Failed to send withdrawal email:", err));
    }`;

content = content.replace(oldWithdraw, newWithdraw);

fs.writeFileSync('services/leaveHelper.ts', content);
console.log("Updated leaveHelper.ts properly");
