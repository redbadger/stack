open Jest;

open Expect;

open Config;

Only.describe(
  "should find the first unused port above 8000",
  (_) => {
    test(
      "when only one",
      (_) => {
        let expected = 8001;
        let actual =
          Ports.findNext([
            {stack: "services", name: "visualizer", aliases: [], health: None, port: Some(8000)}
          ]);
        expect(actual) |> toEqual(expected)
      }
    );
    test(
      "when one but without port",
      (_) => {
        let expected = 8000;
        let actual =
          Ports.findNext([
            {stack: "services", name: "fsdkflkdf", aliases: [], health: None, port: None}
          ]);
        expect(actual) |> toEqual(expected)
      }
    );
    test(
      "when there is a gap",
      (_) => {
        let expected = 8000;
        let actual =
          Ports.findNext([
            {stack: "services", name: "fsdkflkdf", aliases: [], health: None, port: None},
            {stack: "app", name: "rproxy", aliases: ["web"], health: None, port: Some(8001)}
          ]);
        expect(actual) |> toEqual(expected)
      }
    );
    test(
      "when multiple",
      (_) => {
        let expected = 8003;
        let actual =
          Ports.findNext([
            {stack: "services", name: "fsdkflkdf", aliases: [], health: None, port: Some(8000)},
            {stack: "services", name: "fsdkflkdf", aliases: [], health: None, port: Some(8002)},
            {stack: "app", name: "rproxy", aliases: ["web"], health: None, port: Some(8001)}
          ]);
        expect(actual) |> toEqual(expected)
      }
    )
  }
);

describe(
  "assignPorts",
  (_) => {
    test(
      "should assign ports to those without",
      (_) => {
        let desiredServices = [
          {stack: "app", name: "rproxy", aliases: ["web"], health: None, port: None}
        ];
        let existingServices = [
          {stack: "services", name: "visualizer", aliases: [], health: None, port: Some(8000)}
        ];
        let expected = [
          {stack: "app", name: "rproxy", aliases: ["web"], health: None, port: Some(8001)}
        ];
        let actual = Ports.assign(desiredServices, existingServices);
        expect(actual) |> toEqual(expected)
      }
    );
    test(
      "should not change port numbers already assigned",
      (_) => {
        let desiredServices = [
          {stack: "services", name: "visualizer", aliases: [], health: None, port: Some(8000)}
        ];
        let existingServices = [
          {stack: "services", name: "visualizer", aliases: [], health: None, port: Some(8000)}
        ];
        let expected = [
          {stack: "services", name: "visualizer", aliases: [], health: None, port: Some(8000)}
        ];
        let actual = Ports.assign(desiredServices, existingServices);
        expect(actual) |> toEqual(expected)
      }
    )
  }
);
