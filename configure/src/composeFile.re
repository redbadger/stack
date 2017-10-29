open Config;

/* import fs from 'fs';
   import getRepoInfo from 'git-repo-info';
   import getStream from 'get-stream';
   import path from 'path';
   import { chain, forEach, fromPairs, groupBy, join, map, toPairs } from 'ramda';

   import { log } from './log.re';
   import { exec, getEnv } from './docker-server'; */
let join = List.fold_left((a, x) => a ++ x, "");

let group = (f, l) => {
  let rec grouping = (acc) =>
    fun
    | [] => acc
    | [hd, ...tl] => {
        let (l1, l2) = List.partition(f(hd), tl);
        grouping([[hd, ...l1], ...acc], l2)
      };
  grouping([], l)
};

let createPortOverlays = (services: list(service)) => {
  let grouped: list(list(service)) = group((s1, s2) => s1.stack === s2.stack, services);
  List.map(
    (services) => (
      List.hd(services).stack,
      List.fold_left(
        (acc: string, svc: service) =>
          acc
          ++ (
            switch svc.port {
            | None => ""
            | Some(p) =>
              "\n  " ++ (svc.name ++ (":\n    ports:\n      - " ++ (string_of_int(p) ++ ":3000")))
            }
          ),
        {|version: "3.1"

services:|},
        services
      )
    ),
    grouped
  )
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
