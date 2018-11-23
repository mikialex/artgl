export class Acumulator {
  constructor(size?: number) {
    this.size = size || 10;
    this.reset();
  }
  private size = 10;
  private count = 0;
  private records: number[] = [];

  private all = 0;
  private average = 0;

  push(record: number) {
    this.count++;

    const current = this.count % this.size;
    const last = Math.max(0, this.count - 10) % this.size;

    this.all -= this.records[last];
    this.all += record;
    this.records[current] = record;

    if (this.count >= this.size) {
      this.average = this.all / this.size;
    } else {
      this.average = this.all / this.count;
    }

  }

  reset() {
    this.count = 0;
    this.records = [];
    for (let i = 0; i < this.size; i++) {
      this.records.push(0);
    }
  }

  resetSize(size: number) {
    this.size = size;
    this.reset();
  }

  getAverage() {
    return this.average;
  }

}
