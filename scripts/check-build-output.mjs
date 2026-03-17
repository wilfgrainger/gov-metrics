import { spawn } from "node:child_process";

const child = spawn("npm run build", {
  env: process.env,
  shell: true,
  stdio: ["inherit", "pipe", "pipe"],
});

let output = "";

for (const stream of [child.stdout, child.stderr]) {
  stream.on("data", (chunk) => {
    const text = chunk.toString();
    output += text;
    process.stdout.write(text);
  });
}

const exitCode = await new Promise((resolve) => {
  child.on("close", resolve);
});

if (exitCode !== 0) {
  process.exit(exitCode ?? 1);
}

if (/width\(-1\)|height\(-1\)|The width\(-1\)/.test(output)) {
  console.error("Build emitted Recharts sizing warnings.");
  process.exit(1);
}
