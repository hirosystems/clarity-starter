import { tx } from "@hirosystems/clarinet-sdk";
import { Cl, UIntCV } from "@stacks/transactions";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(async () => {
  await vm.initSession(process.cwd(), "./Clarinet.toml");
});

const accounts = vm.getAccounts();
const w1 = accounts.get("wallet_1")!;
describe("test get counter", () => {
  it("ensures <get-counter> send the counter value", () => {
    const { result } = vm.callReadOnlyFn("counter", "get-counter", [], w1);
    expect(result).toBeUint(0);
  });

  // we can actualy get the values in two ways
  it("ensures the counter variable hold the right value", () => {
    const counter = vm.getDataVar("counter", "counter");
    expect(counter).toBeUint(0);
  });
});

describe("test <increment>", () => {
  it("ensures <increment> adds 1", () => {
    const { result } = vm.callPublicFn("counter", "increment", [], w1);
    expect(result).toBeOk(Cl.bool(true));

    const counter = vm.getDataVar("counter", "counter");
    expect(counter).toBeUint(1);
  });
});

describe("test <decrement>", () => {
  it("ensures <decrement> removes 1", () => {
    const originalCounter = vm.getDataVar("counter", "counter");
    const originalValue = (originalCounter as UIntCV).value;

    const block = vm.mineBlock([
      tx.callPublicFn("counter", "increment", [], w1),
      tx.callPublicFn("counter", "decrement", [], w1),
    ]);

    expect(block[0].result).toBeOk(Cl.bool(true));
    expect(block[1].result).toBeOk(Cl.bool(true));

    const counter = vm.getDataVar("counter", "counter");
    expect(counter).toBeUint(originalValue);
  });

  it("ensures <decrement> throws an error if result is lower than 0", async () => {
    const { result } = vm.callPublicFn("counter", "decrement", [], w1);
    expect(result).toBeErr(Cl.uint(401));
  });
});

describe("test <add>", () => {
  it("ensures <add> adds up the right amout", () => {
    const { result } = vm.callPublicFn("counter", "add", [Cl.uint(3)], w1);
    expect(result).toBeOk(Cl.bool(true));

    const counter = vm.getDataVar("counter", "counter");
    expect(counter).toBeUint(3);
  });

  it("ensures <add> throws an error if n is too low", () => {
    const { result } = vm.callPublicFn("counter", "add", [Cl.uint(1)], w1);
    expect(result).toBeErr(Cl.uint(402));
  });
});
