/**
 * Start the Spring Boot admin API for local development, if it is not already running.
 *
 * Why this exists: the portal login (/portal/login), the public forms and the chat widget all
 * call http://localhost:8080 in dev. When nothing listens there the portal shows
 * "Could not reach the server" and every form fails. Before this script, the backend had to be
 * remembered and started by hand in IntelliJ; forgetting it was the usual cause of that message.
 *
 * Behaviour:
 *   1. If something already answers on :8080 (IntelliJ run, an earlier terminal) -> do nothing.
 *   2. Otherwise run `mvnw spring-boot:run` in the backend checkout and stream its log here.
 *
 * Where the backend lives: KEAA_BACKEND_DIR if set, else <home>/IdeaProjects/keaa-admin-api.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const PORT = 8080;
const BACKEND_DIR = process.env.KEAA_BACKEND_DIR || path.join(os.homedir(), 'IdeaProjects', 'keaa-admin-api');

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
    socket.setTimeout(1500, () => { socket.destroy(); resolve(false); });
  });
}

if (await portInUse(PORT)) {
  console.log(`[api] something already listens on :${PORT} — not starting a second backend.`);
  process.exit(0);
}

if (!existsSync(path.join(BACKEND_DIR, 'pom.xml'))) {
  console.error(
    `[api] backend not found at ${BACKEND_DIR}\n` +
      `      Clone https://github.com/Gitkeaa/keaa-admin-api there, or set KEAA_BACKEND_DIR to its folder.\n` +
      `      Until then the portal and the forms will show "Could not reach the server".`
  );
  process.exit(1);
}

const isWin = process.platform === 'win32';
// Absolute path: cmd.exe does not look in the child's cwd for a bare "mvnw.cmd".
const mvnw = path.join(BACKEND_DIR, isWin ? 'mvnw.cmd' : 'mvnw');
console.log(`[api] starting Spring Boot from ${BACKEND_DIR} (first run downloads Maven deps, later runs take ~20s)`);

// One command string through the shell (a .cmd file cannot be exec'd directly on Windows);
// the wrapper path is quoted so a space in the user's home directory does not split it.
const child = spawn(`"${mvnw}" -q spring-boot:run`, {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(
      `[api] backend exited with code ${code}. Common causes: MySQL80 service stopped ` +
        `(net start MySQL80), or port ${PORT} taken by another process.`
    );
  }
  process.exit(code ?? 0);
});

// Ctrl+C must take the WHOLE tree down. mvnw runs Maven in one JVM, which forks the Spring
// Boot app into a second one; killing only the first leaves the app holding :8080, and the next
// "npm run dev:all" would then refuse to start with "port already in use". On Windows,
// taskkill /T is the only way to reach that grandchild.
function stop() {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, stop);
process.on('exit', stop);
