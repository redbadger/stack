open Jest;

open Expect;

open Config;

external process : Js.t {. cwd [@bs.meth] : unit => string} = "" [@@bs.module];

let cwd = process##cwd ();

describe
  "compose-file"
  (
    fun _ =>
      test
        "should create the correct port overlays"
        (
          fun _ => {
            let services: list service = [
              {stack: "services", name: "visualizer", aliases: [], health: None, port: Some 8080},
              {stack: "app", name: "rproxy", aliases: ["web"], health: None, port: Some 80},
              {stack: "app", name: "gateway", aliases: ["api"], health: None, port: Some 8000},
              {stack: "app", name: "gateway1", aliases: ["api1"], health: None, port: Some 8001}
            ];
            let expected = [
              (
                "services",
                {|version: "3.1"

   services:
     visualizer:
       ports:
         - 8080:3000

   |}
              ),
              (
                "app",
                {|version: "3.1"

   services:
     rproxy:
       ports:
         - 80:3000
     gateway:
       ports:
         - 8000:3000
     gateway1:
       ports:
         - 8001:3000

   |}
              )
            ];
            let actual = ComposeFile.createPortOverlays services;
            expect actual |> toEqual expected
          }
        )
      /* test
           "should merge the files correctly"
           (
             fun _ => {
               let filesByStack = [("a", ["a.yml", "b.yml", "c.yml"])];
               let expectedCall = [
                 "mgr1",
                 "docker-compose",
                 ["-f", {|$cwd/a.yml|}, "-f", {|$cwd/b.yml|}, "-f", {|$cwd/c.yml|}, "config"]
               ];
               let actualCall = ref [];
               let actual = [("a", "merged")];
               let expected =
                 merge (
                   (
                     fun server cmd args => {
                       actualCall := [server, cmd, args];
                       "merged"
                     }
                   )
                     "mgr1" filesByStack false
                 );
               expect actualCall |> toEqual expectedCall;
               expect actual |> toEqual expected
             }
           );
         test
           "should merge and resolve the files correctly"
           (
             fun _ => {
               let filesByStack = [("a", ["a.yml", "b.yml", "c.yml"])];
               let expectedCall = [
                 "mgr1",
                 "docker-compose",
                 [
                   "-f",
                   {|$cwd/a.yml|},
                   "-f",
                   {|$cwd/b.yml|},
                   "-f",
                   {|$cwd/c.yml|},
                   "config",
                   "--resolve-image-digests"
                 ]
               ];
               let actualCall = ref [];
               let actual = [("a", "merged")];
               let expected =
                 merge (
                   (
                     fun server cmd args => {
                       actualCall := [server, cmd, args];
                       "merged"
                     }
                   )
                     "mgr1" filesByStack true
                 );
               expect actualCall |> toEqual expectedCall;
               expect actual |> toEqual expected
             }
           );
         test
           "should write the files correctly"
           (
             fun _ => {
               let files = [("a", "a1"), ("b", "b1")];
               let contents = ref [];
               let paths =
                 write (
                   (fun filePath content => contents := [(filePath, content), ...!contents])
                     files "ports"
                 );
               let expectedContents = [({|$cwd/a-ports.yml|}, "a1"), ({|$cwd/b-ports.yml|}, "b1")];
               expect contents |> toEqual expectedContents;
               let expectedFiles = [("a", "a-ports.yml"), ("b", "b-ports.yml")];
               expect paths |> toEqual expectedFiles
             }
           ) */
  );
