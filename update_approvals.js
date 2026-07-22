const fs = require('fs');

// 1. Add compOffStatusUpdateTemplate
let templatesContent = fs.readFileSync('utils/emailTemplates.ts', 'utf8');

const newTemplate = `
export const compOffStatusUpdateTemplate = (employeeName: string, daysGranted: number, status: string, adminNote: string) => {
    const statusColor = status.toLowerCase() === 'approved' ? '#27ae60' : (status.toLowerCase() === 'rejected' ? '#c0392b' : '#f39c12');
    
    return \`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: \${statusColor};">Comp-Off Request \${status.toUpperCase()}</h2>
        <p>Dear \${employeeName},</p>
        <p>Your request for <strong>\${daysGranted} day(s)</strong> of Comp-Off has been <strong style="color: \${statusColor};">\${status}</strong>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid \${statusColor}; margin-top: 15px;">
            <p style="margin: 0;"><strong>Admin Note:</strong> \${adminNote || 'No additional notes provided.'}</p>
        </div>
        <br/>
        <p>Log in to the Leave Portal for more details.</p>
        <p><a href="https://lp.landmaarkdeveloper.com" style="display: inline-block; padding: 8px 15px; margin-top: 10px; background-color: #7e57c2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Leave Portal</a></p>
        <br/>
        <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
    </div>
    \`;
};
`;

if (!templatesContent.includes('compOffStatusUpdateTemplate')) {
    templatesContent += newTemplate;
    fs.writeFileSync('utils/emailTemplates.ts', templatesContent);
}

// 2. Update sendStatusEmail in leaveHelper.ts
let leaveHelper = fs.readFileSync('services/leaveHelper.ts', 'utf8');

const oldSendStatusEmail = `export const sendStatusEmail = async (leave: any, status: string, adminNote: string): Promise<void> => {
    if (leave.employee?.email) {
        sendEmail({
            to: leave.employee.email, subject: \`Leave Request \${status.toUpperCase()}\`, text: \`Your leave has been \${status}.\`,
            html: leaveStatusUpdateTemplate(leave.employee.full_name, leave.start_date.toDateString(), leave.end_date.toDateString(), status, adminNote || '')
        }).catch(err => console.error("Failed to send status email:", err));
    }
};`;

const newSendStatusEmail = `export const sendStatusEmail = async (leave: any, status: string, adminNote: string): Promise<void> => {
    if (leave.employee?.email) {
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = adminAndHrEmails.filter(email => email !== leave.employee.email);
        
        sendEmail({
            to: leave.employee.email,
            cc: ccEmails,
            subject: \`Leave Request \${status.toUpperCase()}\`, 
            text: \`Your leave has been \${status}.\`,
            html: leaveStatusUpdateTemplate(leave.employee.full_name, leave.start_date.toDateString(), leave.end_date.toDateString(), status, adminNote || '')
        }).catch(err => console.error("Failed to send status email:", err));
    }
};`;

leaveHelper = leaveHelper.replace(oldSendStatusEmail, newSendStatusEmail);
fs.writeFileSync('services/leaveHelper.ts', leaveHelper);


// 3. Update compOffService.ts to send email on action
let compOffService = fs.readFileSync('services/compOffService.ts', 'utf8');

if (!compOffService.includes('compOffStatusUpdateTemplate')) {
    compOffService = compOffService.replace(
        "import { compOffAppliedAdminTemplate } from '../utils/emailTemplates';",
        "import { compOffAppliedAdminTemplate, compOffStatusUpdateTemplate } from '../utils/emailTemplates';"
    );
}

const oldActionCompOff = `export const actionCompOffService = async (id: number, admin_id: number, status: string, adminNote: string) => {
    logger.info("[Backend] Executing actionCompOffService in compOffService.ts");
    const request = await prisma.compOffGrant.findUnique({ where: { id } });
    if (!request) throw new Error("Request not found");
    if (request.status !== 'pending') throw new Error("Request is already processed");

    await prisma.$transaction(async (tx) => {
        await tx.compOffGrant.update({
            where: { id },
            data: { status, adminNote, grantedBy: admin_id }
        });
        if (status === 'approved') {
            await tx.profiles.update({
                where: { id: request.employeeId },
                data: { available_leaves: { increment: request.daysGranted } }
            });
        }
    });
};`;

const newActionCompOff = `export const actionCompOffService = async (id: number, admin_id: number, status: string, adminNote: string) => {
    logger.info("[Backend] Executing actionCompOffService in compOffService.ts");
    const request = await prisma.compOffGrant.findUnique({ 
        where: { id },
        include: { employee: true }
    });
    if (!request) throw new Error("Request not found");
    if (request.status !== 'pending') throw new Error("Request is already processed");

    await prisma.$transaction(async (tx) => {
        await tx.compOffGrant.update({
            where: { id },
            data: { status, adminNote, grantedBy: admin_id }
        });
        if (status === 'approved') {
            await tx.profiles.update({
                where: { id: request.employeeId },
                data: { available_leaves: { increment: request.daysGranted } }
            });
        }
    });

    try {
        if (request.employee && request.employee.email) {
            const adminAndHrEmails = await getAdminAndHrEmails();
            const ccEmails = adminAndHrEmails.filter(email => email !== request.employee.email);
            
            sendEmail({
                to: request.employee.email,
                cc: ccEmails,
                subject: \`Comp-Off Request \${status.toUpperCase()}\`,
                text: \`Your Comp-Off request has been \${status}.\`,
                html: compOffStatusUpdateTemplate(request.employee.full_name, request.daysGranted, status, adminNote)
            }).catch(err => console.error("Failed to send comp-off status email:", err));
        }
    } catch (e) {
        console.error("Failed to send email on comp-off action:", e);
    }
};`;

compOffService = compOffService.replace(oldActionCompOff, newActionCompOff);
fs.writeFileSync('services/compOffService.ts', compOffService);

console.log("Updated approval/rejection emails!");
