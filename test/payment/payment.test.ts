import { PaymentService } from '../../src/payment/payment'

describe('PaymentService - Test Cases (TC)', () => {
  // 001. CONSTRUCTOR
  describe('Constructor', () => {
    test('TC-001: Throw error when amount is 0', () => {
      expect(() => new PaymentService(0)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-002: Throw error when amount is negative', () => {
      expect(() => new PaymentService(-0.01)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-003: Create instance with minimum valid positive amount', () => {
      const service = new PaymentService(0.01)
      expect(service.getAmount()).toBe(0.01)
      expect(service.getIsPaid()).toBe(false)
    })

    test('TC-004: Create instance with nominal amount', () => {
      const service = new PaymentService(100)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })
  })

  // 002. APPLY DISCOUNT
  describe('applyDiscount', () => {
    test('TC-005: Ignore discount when percentage is negative', () => {
      const service = new PaymentService(100)
      service.applyDiscount(-0.01)
      expect(service.getAmount()).toBe(100)
    })

    test('TC-006: Apply 0% discount boundary', () => {
      const service = new PaymentService(100)
      service.applyDiscount(0)
      expect(service.getAmount()).toBe(100)
    })

    test('TC-007: Apply discount just above 0%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(0.01)
      expect(service.getAmount()).toBeCloseTo(99.99)
    })

    test('TC-008: Apply nominal discount', () => {
      const service = new PaymentService(100)
      service.applyDiscount(20)
      expect(service.getAmount()).toBe(80)
    })

    test('TC-009: Apply discount just below 100%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(99.99)
      expect(service.getAmount()).toBeCloseTo(0.01)
    })

    test('TC-010: Apply 100% discount boundary', () => {
      const service = new PaymentService(100)
      service.applyDiscount(100)
      expect(service.getAmount()).toBe(0)
    })

    test('TC-011: Ignore discount when percentage exceeds 100%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(100.01)
      expect(service.getAmount()).toBe(100)
    })

    test('TC-012: Apply consecutive discounts on updated amount', () => {
      const service = new PaymentService(100)
      service.applyDiscount(20) // 100 -> 80
      service.applyDiscount(50) // 80 -> 40
      expect(service.getAmount()).toBe(40)
    })

    test('TC-013: Ignore discount if payment is already completed', () => {
      const service = new PaymentService(100)
      service.pay()
      service.applyDiscount(20)
      expect(service.getAmount()).toBe(100)
    })
  })

  // 003. PAY
  describe('pay', () => {
    test('TC-014: Return true and set isPaid to true on first call', () => {
      const service = new PaymentService(100)
      expect(service.pay()).toBe(true)
      expect(service.getIsPaid()).toBe(true)
    })

    test('TC-015: Return false on duplicate payment attempt', () => {
      const service = new PaymentService(100)
      service.pay()
      expect(service.pay()).toBe(false)
      expect(service.getIsPaid()).toBe(true)
    })
  })
})