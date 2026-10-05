import { PaymentService } from '../../src/payment/payment2'

describe('PaymentService - Test Cases (TC)', () => {
  // 001. CONSTRUCTOR
  describe('Constructor', () => {
    // Boundary
    test('TC-002: Throw error when amount is 0', () => {
      expect(() => new PaymentService(0)).toThrow(
        'Amount must be greater than 0',
      )
    })

    test('TC-003: Create instance with minimum valid positive amount', () => {
      const service = new PaymentService(0.01)
      expect(service.getAmount()).toBe(0.01)
    })

    // Negative
    test('TC-005: Throw error when amount is NaN', () => {
      expect(() => new PaymentService(NaN)).toThrow(
        'Amount must be greater than 0',
      )
    })
  })

  // 002. APPLY DISCOUNT
  describe('applyDiscount', () => {
    // Boundary
    test('TC-010: Ignore discount when percentage is just below 0%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(-0.01)
      expect(service.getAmount()).toBe(100)
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

    // Positive
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
    })

    // Negative
    test('TC-019: Ignore discount when percentage is NaN', () => {
      const service = new PaymentService(100)
      service.applyDiscount(NaN)
      expect(service.getAmount()).toBe(100)
    })
  })

  // 003. PAY
  describe('pay', () => {
    // Positive
    test('TC-024: Return true on first payment', () => {
      const service = new PaymentService(100)
      expect(service.pay()).toBe(true)
    })

    test('TC-025: Return false on duplicate payment attempt', () => {
      const service = new PaymentService(100)
      service.pay()
      expect(service.pay()).toBe(false)
    })
  })
})
