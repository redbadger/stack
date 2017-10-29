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

let merge = (execFn, server, filesByStack, resolve) =>
  List.map(
    ((stack, files)) => {
      let fileArgs = List.concat(List.map((f) => ["-f", Node.Path.resolve([|f|])], files));
      let resolveArgs = resolve ? ["--resolve-image-digests"] : [];
      (stack, execFn(server, "docker-compose", fileArgs @ resolveArgs @ ["config"]))
    },
    filesByStack
  );

let write = (writeFn, filesByStack, stage) =>
  List.map(
    ((stack, content)) => (
      stack,
      writeFn(Node.Path.resolve([|{j|$stack-$stage.yml|j}|]), content)
    ),
    filesByStack
  );
/* let execFn = async (server, cmd, args, stdout = false, stderr = true) => {
       let env = await getEnv(server);
       env.tag = process.env.tag || getRepoInfo().abbreviatedSha;
       let cp = exec(env, cmd, args, stdout, stderr);
       return getStream(cp.stdout);
     };


     let writeFn = (filePath, content) => {
       log(`Writing ${filePath}`);
       fs.writeFileSync(filePath, content);
     };

   */
