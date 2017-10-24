open Config;

/* import fs from 'fs';
   import getRepoInfo from 'git-repo-info';
   import getStream from 'get-stream';
   import path from 'path';
   import { chain, forEach, fromPairs, groupBy, join, map, toPairs } from 'ramda';

   import { log } from './log.re';
   import { exec, getEnv } from './docker-server'; */
let createPortOverlays (services: list service) => {
  let sorted = List.sort compare services;
  let result = ref [];
  let current = ref ("", "");
  List.iter (
    fun (s: service) => {
      result := [!current, ...!result];
      if (s.stack !== !stack) {
        stack := s.stack;
        current := (s.stack, {|version: "3.1"

  services:
|})
      } else {
        switch s.port {
        | None => ()
        | Some p =>
          current := (
            s.stack,
            snd !current ^ "    " ^ s.name ^ "\n      ports:\n      - " ^ string_of_int p ^ ":3000"
          )
        }
      }
    }
  );
  !result
};
/* let execFn = async (server, cmd, args, stdout = false, stderr = true) => {
     let env = await getEnv(server);
     env.tag = process.env.tag || getRepoInfo().abbreviatedSha;
     let cp = exec(env, cmd, args, stdout, stderr);
     return getStream(cp.stdout);
   };

   let merge = async (execFn, server, filesByStack, resolve) => {
     let output = {};
     for (let [stack, files] of toPairs(filesByStack)) {
       let args = [...chain(f => ['-f', f], map(path.resolve, files)), 'config'];
       if (resolve) {
         args = [...args, '--resolve-image-digests'];
       }
       output[stack] = await execFn(server, 'docker-compose', args);
     }
     return output;
   };

   let writeFn = (filePath, content) => {
     log(`Writing ${filePath}`);
     fs.writeFileSync(filePath, content);
   };

   let write = (writeFn, filesByStack, stage) => {
     let paths = {};
     forEach(([stack, content]) => {
       let file = `${stack}-${stage}.yml`;
       paths[stack] = file;
       writeFn(path.resolve(file), content);
     }, toPairs(filesByStack));
     return paths;
   }; */
