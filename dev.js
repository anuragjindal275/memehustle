
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');


const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};


if (!fs.existsSync(path.join(__dirname, 'server'))) {
  console.error(`${colors.red}Error: Server folder not found!${colors.reset}`);
  process.exit(1);
}

if (!fs.existsSync(path.join(__dirname, 'client'))) {
  console.error(`${colors.red}Error: Client folder not found!${colors.reset}`);
  process.exit(1);
}


console.log(`${colors.cyan}
╔═╗╦ ╦╔╗ ╔═╗╦═╗╔═╗╦ ╦╔╗╔╦╔═  ╔╦╗╔═╗╔╦╗╔═╗  ╦ ╦╦ ╦╔═╗╔╦╗╦  ╔═╗
║  ╚╦╝╠╩╗║╣ ╠╦╝╠═╝║ ║║║║╠╩╗  ║║║║╣ ║║║║╣   ╠═╣║ ║╚═╗ ║ ║  ║╣ 
╚═╝ ╩ ╚═╝╚═╝╩╚═╩  ╚═╝╝╚╝╩ ╩  ╩ ╩╚═╝╩ ╩╚═╝  ╩ ╩╚═╝╚═╝ ╩ ╩═╝╚═╝
${colors.reset}`);

console.log(`${colors.yellow}Starting development servers...${colors.reset}`);


const serverProcess = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true
});


const clientProcess = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true
});


serverProcess.stdout.on('data', (data) => {
  console.log(`${colors.green}[SERVER] ${colors.reset}${data}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`${colors.red}[SERVER ERROR] ${colors.reset}${data}`);
});


clientProcess.stdout.on('data', (data) => {
  console.log(`${colors.blue}[CLIENT] ${colors.reset}${data}`);
});

clientProcess.stderr.on('data', (data) => {
  console.error(`${colors.magenta}[CLIENT] ${colors.reset}${data}`);
});


const cleanup = () => {
  console.log(`${colors.yellow}\nShutting down development servers...${colors.reset}`);
  serverProcess.kill();
  clientProcess.kill();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);


serverProcess.on('close', (code) => {
  console.log(`${colors.red}[SERVER] Process exited with code ${code}${colors.reset}`);
  cleanup();
});

clientProcess.on('close', (code) => {
  console.log(`${colors.red}[CLIENT] Process exited with code ${code}${colors.reset}`);
  cleanup();
});

console.log(`${colors.cyan}
╔═╗╔═╗╦═╗╦  ╦╔═╗╦═╗╔═╗  ╦═╗╦ ╦╔╗╔╔╗╔╦╔╗╔╔═╗
╚═╗║╣ ╠╦╝╚╗╔╝║╣ ╠╦╝╚═╗  ╠╦╝║ ║║║║║║║║║║║║ ╦
╚═╝╚═╝╩╚═ ╚╝ ╚═╝╩╚═╚═╝  ╩╚═╚═╝╝╚╝╝╚╝╩╝╚╝╚═╝
${colors.reset}`);

console.log(`${colors.green}Backend:${colors.reset} http://localhost:5000`);
console.log(`${colors.blue}Frontend:${colors.reset} http://localhost:3000`);
console.log(`${colors.cyan}Press Ctrl+C to stop all servers${colors.reset}`);
