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
    test(
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
        let actual = [("a", "merged")];
        let expected =
          ComposeFile.merge(
            (server, cmd, args) => {
              actualCall := [server, cmd, ...args];
              "merged"
            },
            "mgr1",
            filesByStack,
            false
          );
        expect((actual, actualCall^)) |> toEqual((expected, expectedCall))
      }
    );
    test(
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
        let actual = [("a", "merged")];
        let expected =
          ComposeFile.merge(
            (server, cmd, args) => {
              actualCall := [server, cmd, ...args];
              "merged"
            },
            "mgr1",
            filesByStack,
            true
          );
        expect((actual, actualCall^)) |> toEqual((expected, expectedCall))
      }
    );
    test(
      "should write the files correctly",
      () => {
        let filesByStack = [("a", "a1"), ("b", "b1")];
        let contents = ref([]);
        let paths =
          ComposeFile.write(
            (filePath, content) => {
              contents := contents^ @ [(filePath, content)];
              filePath
            },
            filesByStack,
            "ports"
          );
        let expectedContents = [
          (Node.Path.resolve([|cwd, "a-ports.yml"|]), "a1"),
          (Node.Path.resolve([|cwd, "b-ports.yml"|]), "b1")
        ];
        let expectedPaths = [
          ("a", Node.Path.resolve([|cwd, "a-ports.yml"|])),
          ("b", Node.Path.resolve([|cwd, "b-ports.yml"|]))
        ];
        expect((contents^, paths)) |> toEqual((expectedContents, expectedPaths))
      }
    )
  }
);
