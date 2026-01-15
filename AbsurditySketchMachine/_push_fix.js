const { spawn } = require('child_process');

console.log('Starting managed db push...');
const child = spawn('npx', ['supabase', 'db', 'push', '--linked', '--include-all'], { shell: true });

child.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    if (output.includes('Do you want to push') || output.includes('[Y/n]')) {
        console.log('Detected prompt, sending "y"...');
        child.stdin.write('y\n');
    }
});

child.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
});

child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
    process.exit(code);
});
