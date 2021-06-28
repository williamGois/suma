import { spawn } from "child_process";
import { readdirSync } from "fs";
import args from "yargs";

const workspace = "src/modules";
const parsedArgs = args.parse();
console.log("parsedArgs", parsedArgs);
const { command, e, i } = parsedArgs;

if (i) {
  if (Array.isArray(i)) {
    i.forEach(name => {
      spawn("yarn", ["run", command], {
        env: process.env,
        cwd: `${process.cwd()}/${workspace}/${name}`,
        stdio: "inherit"
      });
    });
  } else {
    spawn("yarn", ["run", command], {
      env: process.env,
      cwd: `${process.cwd()}/${workspace}/${i}`,
      stdio: "inherit"
    });
  }
} else {
  readdirSync(workspace, { withFileTypes: true })
    .filter(file => file.isDirectory())
    .map(directory => directory.name)
    .forEach(name => {
      console.log(`${process.cwd()}/${workspace}/${name}`);
      if (e === name || (Array.isArray(e) && e.includes(name))) return;
      spawn("yarn", ["run", command], {
        env: process.env,
        cwd: `${process.cwd()}/${workspace}/${name}`,
        stdio: "inherit"
      });
    });
}
