export class PaymentService {
  private amount: number
  private isPaid: boolean = false

  constructor(amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be a finite number')
    }

    this.amount = amount
  }

  applyDiscount(percent: number): void {
    if (
      !Number.isFinite(percent) ||
      percent < 0 ||
      percent > 100 ||
      this.isPaid
    ) {
      return
    }

    this.amount = this.amount - this.amount * (percent / 100)
  }

  pay(): boolean {
    if (this.isPaid) {
      return false
    }

    this.isPaid = true

    return true
  }

  getAmount(): number {
    return this.amount
  }

  getIsPaid(): boolean {
    return this.isPaid
  }
}
