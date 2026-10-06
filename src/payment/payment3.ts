export class PaymentService {
  amount: number
  isPaid: boolean = false

  constructor(amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    this.amount = amount
  }

  applyDiscount(percent: number): void {
    if (percent < 0 || percent > 100 || this.isPaid) {
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
}
