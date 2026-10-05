export class PaymentService {
  private amount: number
  private isPaid: boolean

  constructor(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }
    this.amount = amount
    this.isPaid = false
  }
  applyDiscount(percentage: number): void {
    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100 ||
      this.isPaid
    ) {
      return
    }
    this.amount = this.amount * (1 - percentage / 100)
  }
  pay(): boolean{
    if (this.isPaid)  {
      return false
    }
    this.isPaid = true
    return true
  }
  getAmount(): number{
    return this.amount
  }
}