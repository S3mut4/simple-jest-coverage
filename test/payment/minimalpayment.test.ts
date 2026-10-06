import { PaymentService } from '../../src/payment/payment'

describe('PaymentService - Minimal suite', () => {
  describe('Constructor', () => {
    test('TC-002: Throw error when amount is 0', () => {
      expect(() => new PaymentService(0)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-005: Throw error when amount is NaN', () => {
      expect(() => new PaymentService(NaN)).toThrow(
        'Initial amount must be greater than 0',
      )
    })
  })

  describe('applyDiscount', () => {
    test('TC-010: Ignore discount when percentage is just below 0%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(-0.01)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })

    test('TC-012: Apply discount just above 0%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(0.01)
      expect(service.getAmount()).toBeCloseTo(99.99)
    })

    test('TC-014: Apply 100% discount boundary', () => {
      const service = new PaymentService(100)
      service.applyDiscount(100)
      expect(service.getAmount()).toBe(0)
    })

    test('TC-015: Ignore discount when percentage exceeds 100%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(100.01)
      expect(service.getAmount()).toBe(100)
    })

    test('TC-017: Apply consecutive discounts on updated amount', () => {
      const service = new PaymentService(100)
      service.applyDiscount(20)
      expect(service.getAmount()).toBe(80)
      service.applyDiscount(50)
      expect(service.getAmount()).toBe(40)
    })

    test('TC-018: Ignore discount if payment is already completed', () => {
      const service = new PaymentService(100)
      service.pay()
      service.applyDiscount(20)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(true)
    })

    test('TC-021: Ignore discount when percentage is a string', () => {
      const service = new PaymentService(100)
      // Wrong type forced past TypeScript to simulate runtime input
      const invalidPercent = '20' as unknown as number
      service.applyDiscount(invalidPercent)
      expect(service.getAmount()).toBe(100)
    })
  })

  describe('pay', () => {
    test('TC-024: Return true and set isPaid on first payment', () => {
      const service = new PaymentService(100)
      expect(service.pay()).toBe(true)
      expect(service.getIsPaid()).toBe(true)
    })

    test('TC-025: Return false on duplicate payment attempt', () => {
      const service = new PaymentService(100)
      service.pay()
      expect(service.pay()).toBe(false)
      expect(service.getIsPaid()).toBe(true)
    })
  })
})
