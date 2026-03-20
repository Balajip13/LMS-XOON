import { spawn } from 'child_process';
import fs from 'fs';

const child = spawn('node', ['server.js'], {
    cwd: 'c:/Users/manik/OneDrive/Desktop/xlms/server',
    env: process.env
});

const log = fs.createWriteStream('debug_output.txt');

child.stdout.on('data', (data) => {
    log.write(`STDOUT: ${data}\n`);
});

child.stderr.on('data', (data) => {
    log.write(`STDERR: ${data}\n`);
});

child.on('close', (code) => {
    log.write(`Process exited with code ${code}\n`);
    log.end();
    console.log('Finished capturing output');
});
