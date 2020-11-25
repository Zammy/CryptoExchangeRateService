//This should be export of Domain module

export class DummyTestType {
    constructor(private num: number) { }
    increment() {
        this.num++;
    }
    get(): number {
        return this.num;
    }
}
