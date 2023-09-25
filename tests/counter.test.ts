import { initVM, tx } from "@hirosystems/clarinet-sdk";
import { Cl, UIntCV } from "@stacks/transactions";
import { beforeEach, describe, expect, it } from "vitest";

// By default, the VM is reinitialized before each test and keeps the same state.
// Calling `initVM` in `beforeEach` allows to refresh the state before each test.
beforeEach(async () => {
  await initVM();
});

const accounts = vm.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("test get counter", () => {
  it("ensures <get-count> send the counter value", () => {
    const { result } = vm.callReadOnlyFn("counter", "get-count", [], address1);

    expect(result).toBeUint(0);
  });

  // we can actualy get the values in two ways
  it("ensures the counter variable hold the right value", () => {
    const counter = vm.getDataVar("counter", "count");
    expect(counter).toBeUint(0);
  });
});

describe("test get counter at block height", () => {
  it("ensures <get-count> send the counter value", () => {
    vm.callPublicFn("counter", "increment", [], address1);
    vm.callPublicFn("counter", "increment", [], address1);

    const atBlock1 = vm.callReadOnlyFn("counter", "get-count-at-block", [Cl.uint(1)], address2);
    expect(atBlock1.result).toBeOk(Cl.uint(0));
    const atBlock2 = vm.callReadOnlyFn("counter", "get-count-at-block", [Cl.uint(2)], address1);
    expect(atBlock2.result).toBeOk(Cl.uint(1));
  });

  // we can actualy get the values in two ways
  it("ensures the counter variable hold the right value", () => {
    const counter = vm.getDataVar("counter", "count");
    expect(counter).toBeUint(0);
  });
});

describe("test <increment>", () => {
  it("ensures <increment> adds 1", () => {
    ``;
    const { result } = vm.callPublicFn("counter", "increment", [], address1);
    expect(result).toBeOk(Cl.bool(true));

    const counter = vm.getDataVar("counter", "count");
    expect(counter).toBeUint(1);
  });
});

describe("test <decrement>", () => {
  it("ensures <decrement> removes 1", () => {
    const originalCounter = vm.getDataVar("counter", "count");
    const originalValue = (originalCounter as UIntCV).value;

    const block = vm.mineBlock([
      tx.callPublicFn("counter", "increment", [], address1),
      tx.callPublicFn("counter", "decrement", [], address1),
    ]);

    expect(block[0].result).toBeOk(Cl.bool(true));
    expect(block[1].result).toBeOk(Cl.bool(true));

    const counter = vm.getDataVar("counter", "count");
    expect(counter).toBeUint(originalValue);
  });

  it("ensures <decrement> throws an error if result is lower than 0", async () => {
    const { result } = vm.callPublicFn("counter", "decrement", [], address1);
    expect(result).toBeErr(Cl.uint(1001));
  });
});

describe("test <add>", () => {
  it("ensures <add> adds up the right amout", () => {
    const { result } = vm.callPublicFn("counter", "add", [Cl.uint(3)], address1);
    expect(result).toBeOk(Cl.bool(true));

    const counter = vm.getDataVar("counter", "count");
    expect(counter).toBeUint(3);
  });

  it("ensures <add> throws an error if n is too low", () => {
    const { result } = vm.callPublicFn("counter", "add", [Cl.uint(1)], address1);
    expect(result).toBeErr(Cl.uint(1002));
  });
});
