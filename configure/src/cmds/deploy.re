external mergeComposeFilesFn : string => string => array string => Js.boolean => Js.Promise.t unit =
  "execFn" [@@bs.module "../compose-file"];

external getEnv : string => Js.t {..} = "" [@@bs.module "../docker-server"];

external getDocker : Js.t {..} => Js.t {. listServices : unit => Js.t {..}} =
  "" [@@bs.module "../docker-server"];

/*
 import {
   create as createPortOverrides,
   merge as mergeComposeFiles,
   execFn as mergeComposeFilesFn,
   write as writeComposeFiles,
   writeFn,
 } from "../compose-file";
 import { getDocker } from "../docker-server";
 import { create as createLBConfig, reload as reloadLB, write as writeLBConfig } from "../haproxy";
 import { validate, deploy, execFn } from "../deploy"; */
let command = "deploy [stacks...]";

let desc = {|Deploys the specified stacks.
   If no stacks are specified, then just creates merged compose files.
   |};

let builder = Js.Obj.empty ();

type argv = Js.t {. stacks : array string, file : string, update : Js.boolean, swarm : string};
/* let handler (argv: argv) :Js.Promise.t unit => {
     let stepper =
       Log.step (2 + (argv##update === Js.true_ ? 1 : 0) + (Array.length argv##stacks > 0 ? 3 : 0));
     let nextStep = ref 0;
     let logStep msg => {
       nextStep := !nextStep + 1;
       stepper !nextStep msg
     };
     let config = Config.load (Node.Path.resolve [|argv##file|]);
     logStep "Scanning swarm and configuring ports";
     getEnv argv##swarm |>
     Js.Promise.then_ (
       fun env => {
         let docker = getDocker env;
         docker##listServices () |>
         Js.Promise.then_ (
           fun existing => {
             let configured = List.concat (List.map (fun stack => stack.services) config.stacks);
             let servicesWithPorts =
               Services.findWithports existing |> Ports.assign configured;
             let portOverrides = createPortOverrides servicesWithPorts;
             let portOverrideFilesByStack = writeComposeFiles writeFn portOverrides "ports";
             (
               if (argv.update === Js.true_) {
                 logStep "Updating load balancer";
                 let loadBalancerConfig = createLBConfig servicesWithPorts argv.domain;
                 writeLBConfig loadBalancerConfig;
                 reloadLB ()
               } else {
                 Js.Promise.resolve ()
               }
             ) |>
             Js.Promise.then_ (
               fun _ => {
                 logStep "Merging compose files";
                 let filenamesByStack = getComposeFiles stackConfig.stacks;
                 let unresolved =
                   mergeComposeFiles
                     mergeComposeFilesFn
                     "local"
                     mergeWith
                     (concat filenamesByStack map (fun x => [x], portOverrideFilesByStack))
                     Js.false_;
                 writeComposeFiles writeFn unresolved "unresolved";
                 if (argv.stacks.length > 0) {
                   let validations = validate argv##stacks stackConfig;
                   if (validations##messages##length > 0) {
                     Log.err (String.concat ", " (Array.to_list validations##messages))
                   } else {
                     logStep "Pulling images";
                     let promises =
                       Array.map
                         (
                           fun stack _ =>
                             execFn
                               argv##swarm
                               "docker-compose"
                               ["-f", {j|$stack-unresolved.yml|j}, "pull"]
                         )
                         validations.stacks;
                     Js.Promise.(
                       Array.fold_left (fun a b _ => a () |> then_ b) (fun _ => resolve ()) promises
                     )
                       () |>
                     Js.Promise.then_ (
                       fun _ => {
                         logStep "Resolving images";
                         let resolved =
                           mergeComposeFiles
                             mergeComposeFilesFn
                             argv##swarm
                             mergeWith
                             (concat filenamesByStack map (fun x => [x], portOverrideFilesByStack))
                             Js.true_;
                         writeComposeFiles writeFn resolved "resolved";
                         logStep "Deploying";
                         deploy execFn argv##swarm validations##stacks
                       }
                     )
                   }
                 }
               }
             )
           }
         )
       }
     )
   }; */
