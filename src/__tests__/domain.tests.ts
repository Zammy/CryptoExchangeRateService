import { DummyTestType } from "../Domain";

describe("Domain tests", () => {
  test("DummyTestType can increment ", () => {
    const dummy = new DummyTestType(1);

    dummy.increment();

    expect(dummy.get()).toBe(2);
  });
  test("DummyTestType failing test ", () => {
    const dummy = new DummyTestType(1);

    dummy.increment();

    expect(dummy.get()).toBe(1);
  });
});