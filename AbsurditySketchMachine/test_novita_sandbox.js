const { Sandbox } = require('novita-sandbox/code-interpreter');

async function main() {
    const NOVITA_API_KEY = 'sk_Yj_ZjHWkqfCCMS0vBSfHZE0g8BZaWOyPjBaA1KH_3II';

    console.log('--- Initializing Novita AI Agent Sandbox ---');
    try {
        const sandbox = await Sandbox.create({
            apiKey: NOVITA_API_KEY
        });
        console.log('Sandbox created successfully!');

        console.log('Running code: print("Hello from Novita Sandbox!")');
        const execution = await sandbox.runCode('print("Hello from Novita Sandbox!")');

        console.log('Execution Logs:', execution.logs);

        if (execution.error) {
            console.error('Execution Error:', execution.error);
        }

        console.log('Terminating sandbox...');
        await sandbox.kill();
        console.log('Sandbox terminated.');
    } catch (error) {
        console.error('Failed to set up or run sandbox:', error);
    }
}

main();
