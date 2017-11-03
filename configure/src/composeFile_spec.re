open Jest;

open Expect;

open Config;

[@bs.val] external cwd : unit => string = "process.cwd";

let cwd = cwd();

describe(
  "compose-file",
  () => {
    test(
      "should create the correct port overlays",
      () => {
        let services: list(service) = [
          {stack: "services", name: "visualizer", aliases: [], health: None, port: Some(8080)},
          {stack: "app", name: "rproxy", aliases: ["web"], health: None, port: Some(80)},
          {stack: "app", name: "gateway", aliases: ["api"], health: None, port: Some(8000)},
          {stack: "app", name: "gateway1", aliases: ["api1"], health: None, port: Some(8001)}
        ];
        let expected = [
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
      - 8001:3000|}
          ),
          ("services", {|version: "3.1"

services:
  visualizer:
    ports:
      - 8080:3000|})
        ];
        let actual = ComposeFile.createPortOverlays(services);
        expect(actual) |> toEqual(expected)
      }
    );
    testPromise(
      "should merge the files correctly",
      () => {
        let filesByStack = [("a", ["a.yml", "b.yml", "c.yml"])];
        let expectedCall = [
          "mgr1",
          "docker-compose",
          "-f",
          Node.Path.resolve([|cwd, "a.yml"|]),
          "-f",
          Node.Path.resolve([|cwd, "b.yml"|]),
          "-f",
          Node.Path.resolve([|cwd, "c.yml"|]),
          "config"
        ];
        let actualCall = ref([]);
        let expected = [("a", "merged")];
        let actual =
          ComposeFile.merge(
            (server, cmd, args) => {
              actualCall := [server, cmd, ...args];
              Js.Promise.resolve("merged")
            },
            "mgr1",
            filesByStack,
            false
          );
        let (stacks, files) = List.split(actual);
        Js.Promise.all(Array.of_list(files))
        |> Js.Promise.then_(
             (f) => {
               let actual = List.combine(stacks, Array.to_list(f));
               Js.Promise.resolve(
                 expect((actual, actualCall^)) |> toEqual((expected, expectedCall))
               )
             }
           )
      }
    );
    testPromise(
      "should merge and resolve the files correctly",
      () => {
        let filesByStack = [("a", ["a.yml", "b.yml", "c.yml"])];
        let expectedCall = [
          "mgr1",
          "docker-compose",
          "-f",
          Node.Path.resolve([|cwd, "a.yml"|]),
          "-f",
          Node.Path.resolve([|cwd, "b.yml"|]),
          "-f",
          Node.Path.resolve([|cwd, "c.yml"|]),
          "--resolve-image-digests",
          "config"
        ];
        let actualCall = ref([]);
        let expected = [("a", "merged")];
        let actual =
          ComposeFile.merge(
            (server, cmd, args) => {
              actualCall := [server, cmd, ...args];
              Js.Promise.resolve("merged")
            },
            "mgr1",
            filesByStack,
            true
          );
        let (stacks, files) = List.split(actual);
        Js.Promise.all(Array.of_list(files))
        |> Js.Promise.then_(
             (f) => {
               let actual = List.combine(stacks, Array.to_list(f));
               Js.Promise.resolve(
                 expect((actual, actualCall^)) |> toEqual((expected, expectedCall))
               )
             }
           )
      }
    );
    testPromise(
      "should write the files correctly",
      () => {
        let contentByStack = [
          ("a", Js.Promise.resolve("content for a")),
          ("b", Js.Promise.resolve("content for b"))
        ];
        let contents = ref([]);
        let actualPaths =
          ComposeFile.write(
            (file, content) => contents := contents^ @ [(file, content)],
            contentByStack,
            "ports"
          );
        let expectedContents = [
          (Node.Path.resolve([|cwd, "a-ports.yml"|]), "content for a"),
          (Node.Path.resolve([|cwd, "b-ports.yml"|]), "content for b")
        ];
        let expectedPaths = [
          ("a", Node.Path.resolve([|cwd, "a-ports.yml"|])),
          ("b", Node.Path.resolve([|cwd, "b-ports.yml"|]))
        ];
        let (stacks, paths) = List.split(actualPaths);
        Js.Promise.all(Array.of_list(paths))
        |> Js.Promise.then_(
             (paths) => {
               let actual = List.combine(stacks, Array.to_list(paths));
               Js.Promise.resolve(
                 expect((contents^, actual)) |> toEqual((expectedContents, expectedPaths))
               )
             }
           )
      }
    )
  }
);
