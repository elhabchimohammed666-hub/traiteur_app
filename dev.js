const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[32m[Elhabchi Traiteur]\x1b[0m Démarrage simultané du Serveur API (port 5000) et du Client Web (port 5173)...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Démarrer le serveur backend dans son propre dossier
const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Démarrer le client frontend dans son propre dossier
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

// Gestion propre de l'arrêt
const cleanup = () => {
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit(0);
};

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Serveur]\x1b[0m Arrêté avec le code ${code}`);
  }
});

client.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Client]\x1b[0m Arrêté avec le code ${code}`);
  }
});

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
