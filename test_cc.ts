import { sendLeaveEmails } from './services/leaveHelper';

async function test() {
    const profile = {
        email: 'test@employee.com',
        full_name: 'Test Employee',
        managers: [
            { email: 'premnankani99@gmail.com' },
            { email: 'gyanani.harish@gmail.com' }
        ]
    };
    
    await sendLeaveEmails(profile, 1, new Date(), new Date(), "Testing CC logic");
}

test();
