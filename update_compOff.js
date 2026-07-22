const fs = require('fs');

let content = fs.readFileSync('utils/emailTemplates.ts', 'utf8');

const compOffTemplate = `
export const compOffAppliedAdminTemplate = (employeeName: string, daysGranted: number, reason: string, workedDates: string[]) => \`
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50;">New Comp-Off Request</h2>
    <p>Hello Admin,</p>
    <p><strong>\${employeeName}</strong> has applied for Comp-Off. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Days Requested:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">\${daysGranted}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Worked Dates:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">\${workedDates.join(', ')}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">\${reason}</td>
        </tr>
    </table>
    <br/>
    <p>Please click below to take action on this request:</p>
    <div style="margin: 20px 0;">
        <a href="https://lp.landmaarkdeveloper.com/admin/comp-offs" style="display: inline-block; padding: 10px 20px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Request</a>
    </div>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
\`;
`;

if (!content.includes('compOffAppliedAdminTemplate')) {
    fs.appendFileSync('utils/emailTemplates.ts', compOffTemplate);
}
console.log("Updated emailTemplates.ts");

let compOffContent = fs.readFileSync('services/compOffService.ts', 'utf8');

// We need to add the imports and email sending logic in requestCompOffService
if (!compOffContent.includes('sendEmail')) {
    compOffContent = compOffContent.replace(
        "import { logger } from '../utils/logger';",
        "import { logger } from '../utils/logger';\nimport { sendEmail, getAdminAndHrEmails } from '../utils/emailService';\nimport { compOffAppliedAdminTemplate } from '../utils/emailTemplates';"
    );
}

const oldCompOffRequest = `export const requestCompOffService = async (employee_id: number, total_days: number, reason: string, workedDates: string[]) => {
    logger.info("[Backend] Executing requestCompOffService in compOffService.ts");
    return await prisma.compOffGrant.create({
        data: {
            employeeId: employee_id,
            grantedAt: new Date(),
            workedDates: workedDates,
            daysGranted: total_days,
            reason: reason,
            status: 'pending'
        }
    });
};`;

const newCompOffRequest = `export const requestCompOffService = async (employee_id: number, total_days: number, reason: string, workedDates: string[]) => {
    logger.info("[Backend] Executing requestCompOffService in compOffService.ts");
    const compOff = await prisma.compOffGrant.create({
        data: {
            employeeId: employee_id,
            grantedAt: new Date(),
            workedDates: workedDates,
            daysGranted: total_days,
            reason: reason,
            status: 'pending'
        }
    });

    try {
        const profile = await prisma.profiles.findUnique({
            where: { id: employee_id },
            include: { managers: { select: { email: true } } }
        });

        if (profile) {
            let targetEmails: string[] = [];
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
                    subject: 'New Comp-Off Request',
                    text: \`Employee \${profile.full_name} applied for \${total_days} days of Comp-Off.\`,
                    html: compOffAppliedAdminTemplate(profile.full_name, total_days, reason, workedDates)
                }).catch(err => console.error("Failed to send email to admin/managers:", err));
            }
        }
    } catch (e) {
        console.error("Failed to process comp-off email:", e);
    }

    return compOff;
};`;

compOffContent = compOffContent.replace(oldCompOffRequest, newCompOffRequest);

fs.writeFileSync('services/compOffService.ts', compOffContent);
console.log("Updated compOffService.ts");
