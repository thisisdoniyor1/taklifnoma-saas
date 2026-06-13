import { spawn } from 'node:child_process';

const mode = process.argv[2] || 'dev';
const forwardedArgs = process.argv.slice(3);
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const clientScript = mode === 'preview' ? 'preview:client' : 'dev:client';
const children = [];
let shuttingDown = false;

const stopAll = (signal = 'SIGTERM') => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (child.pid && !child.killed) {
      child.kill(signal);
    }
  }
};

const startProcess = (label, scriptName, extraArgs = []) => {
  const child = spawn(npmCommand, ['run', scriptName, '--', ...extraArgs], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('error', (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
    stopAll();
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    stopAll();

    if (code !== null) {
      process.exit(code);
    } else if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(0);
    }
  });

  children.push(child);
};

startProcess('client', clientScript, forwardedArgs);
startProcess('api', 'api');

process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));
