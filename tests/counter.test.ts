import { tx } from "@hirosystems/clarinet-sdk";
import { Cl, UIntCV } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("test get counter", () => {
  it("ensures <get-count> send the counter value", async () => {
    const { result } = simnet.callReadOnlyFn("counter", "get-count", [], address1);

    expect(result).toBeUint(0);
  });

  // we can actualy get the values in two ways
  it("ensures the counter variable hold the right value", () => {
    const counter = simnet.getDataVar("counter", "count");
    expect(counter).toBeUint(0);
  });
});

describe("test <increment>", () => {
  it("ensures <increment> adds 1", () => {
    const { result } = simnet.callPublicFn("counter", "increment", [], address1);
    expect(result).toBeOk(Cl.bool(true));

    const counter = simnet.getDataVar("counter", "count");
    expect(counter).toBeUint(1);
  });
});

describe("test <decrement>", () => {
  it("ensures <decrement> removes 1", () => {
    const originalCounter = simnet.getDataVar("counter", "count");
    const originalValue = (originalCounter as UIntCV).value;

    const block = simnet.mineBlock([
      tx.callPublicFn("counter", "increment", [], address1),
      tx.callPublicFn("counter", "decrement", [], address1),
    ]);

    expect(block[0].result).toBeOk(Cl.bool(true));
    expect(block[1].result).toBeOk(Cl.bool(true));

    const counter = simnet.getDataVar("counter", "count");
    expect(counter).toBeUint(originalValue);
  });

  it("ensures <decrement> throws an error if result is lower than 0", async () => {
    const { result } = simnet.callPublicFn("counter", "decrement", [], address1);
    expect(result).toBeErr(Cl.uint(1001));
  });
});

describe("test <add>", () => {
  it("ensures <add> adds up the right amout", () => {
    const { result } = simnet.callPublicFn("counter", "add", [Cl.uint(3)], address1);
    expect(result).toBeOk(Cl.bool(true));

    const counter = simnet.getDataVar("counter", "count");
    expect(counter).toBeUint(3);
  });

  it("ensures <add> throws an error if n is too low", () => {
    const { result } = simnet.callPublicFn("counter", "add", [Cl.uint(1)], address1);
    expect(result).toBeErr(Cl.uint(1002));
  });
});

describe("test get counter at block height", () => {
  it("ensures <get-count> send the counter value", () => {
    simnet.callPublicFn("counter", "increment", [], address1);
    simnet.callPublicFn("counter", "increment", [], address1);

    const atBlock1 = simnet.callReadOnlyFn("counter", "get-count-at-block", [Cl.uint(1)], address2);
    expect(atBlock1.result).toBeOk(Cl.uint(0));
    const atBlock2 = simnet.callReadOnlyFn("counter", "get-count-at-block", [Cl.uint(2)], address1);
    expect(atBlock2.result).toBeOk(Cl.uint(1));
  });

  // we can actualy get the values in two ways
  it("ensures the counter variable hold the right value", () => {
    const counter = simnet.getDataVar("counter", "count");
    expect(counter).toBeUint(0);
  });
});
