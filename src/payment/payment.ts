export class PaymentService {
  private amount: number

  private isPaid: boolean = false

  constructor(initialAmount: number) {
    if (!Number.isFinite(initialAmount) || initialAmount <= 0) {
      throw new Error('Initial amount must be greater than 0')
    }
    this.amount = initialAmount
  }

  applyDiscount(percent: number): void {
    const isValidPercent =
      Number.isFinite(percent) && percent >= 0 && percent <= 100

    if (!isValidPercent || this.isPaid) {
      return
    }

    this.amount = this.amount * (1 - percent / 100)
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
