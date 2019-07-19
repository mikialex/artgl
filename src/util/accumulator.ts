export class Accumulator {
  constructor(size?: number) {
    this.size = size === undefined ? 10: size;
    this.reset();
  }
  private size = 10;
  private count = 0;
  private records: number[] = [];

  private all = 0;

  get average() {
    if (this.count >= this.size) {
      return this.all / this.size;
    } else {
      return this.all / this.count;
    }
  }

  get last() {
    return  Math.max(0, this.count - this.size) % this.size;
  }

  push(record: number) {
    this.count++;

    const current = this.count % this.size;

    this.all -= this.records[this.last];
    this.all += record;
    this.records[current] = record;

  }

  reset() {
    this.count = 0;
    this.all = 0;
    this.records = [];
    for (let i = 0; i < this.size; i++) {
      this.records.push(0);
    }
  }

  resetWithNewSize(size: number) {
    this.size = size;
    this.reset();
  }

}
