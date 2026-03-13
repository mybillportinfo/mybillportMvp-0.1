import { spawn } from 'child_process';

const isProduction = process.env.NODE_ENV === 'production';
const command = isProduction ? 'next' : 'next';
const args = isProduction ? ['start', '-p', '5000'] : ['dev', '-p', '5000'];

const nextProcess = spawn('npx', [command, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  process.exit(code || 0);
});
