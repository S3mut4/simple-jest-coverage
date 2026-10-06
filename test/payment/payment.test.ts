import { PaymentService } from '../../src/payment/payment'

describe('PaymentService - Test Cases (TC)', () => {
  // 001. CONSTRUCTOR
  describe('Constructor', () => {
    // Boundary
    test('TC-001: Throw error when amount is just below 0', () => {
      expect(() => new PaymentService(-0.01)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-002: Throw error when amount is 0', () => {
      expect(() => new PaymentService(0)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-003: Create instance with minimum valid positive amount', () => {
      const service = new PaymentService(0.01)
      expect(service.getAmount()).toBe(0.01)
      expect(service.getIsPaid()).toBe(false)
    })

    // Positive
    test('TC-004: Create instance with nominal amount', () => {
      const service = new PaymentService(100)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })

    // Negative
    test('TC-005: Throw error when amount is NaN', () => {
      expect(() => new PaymentService(NaN)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-006: Throw error when amount is Infinity', () => {
      expect(() => new PaymentService(Infinity)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-007: Throw error when amount is a string', () => {
      // Wrong type forced past TypeScript to simulate runtime input
      const invalidAmount = '100' as unknown as number
      expect(() => new PaymentService(invalidAmount)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    test('TC-008: Throw error when amount is undefined', () => {
      const missingAmount = undefined as unknown as number
      expect(() => new PaymentService(missingAmount)).toThrow(
        'Initial amount must be greater than 0',
      )
    })

    // Data-driven: one result per input. JavaScript coerces [100] to 100
    // and true to 1, so a plain range check would accept them
    test.each([
      { label: 'object', invalidAmount: { amount: 100 } },
      { label: 'array', invalidAmount: [100] },
      { label: 'boolean', invalidAmount: true },
      { label: 'function', invalidAmount: () => 100 },
    ])(
      'TC-009: Throw error when amount is a non-number type ($label)',
      ({ invalidAmount }) => {
        expect(
          () => new PaymentService(invalidAmount as unknown as number),
        ).toThrow('Initial amount must be greater than 0')
      },
    )
  })

  // 002. APPLY DISCOUNT
  describe('applyDiscount', () => {
    // Boundary
    test('TC-010: Ignore discount when percentage is just below 0%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(-0.01)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })

    test('TC-011: Apply 0% discount boundary', () => {
      const service = new PaymentService(100)
      service.applyDiscount(0)
      expect(service.getAmount()).toBe(100)
    })

    test('TC-012: Apply discount just above 0%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(0.01)
      expect(service.getAmount()).toBeCloseTo(99.99)
    })

    test('TC-013: Apply discount just below 100%', () => {
      const service = new PaymentService(100)
      service.applyDiscount(99.99)
      expect(service.getAmount()).toBeCloseTo(0.01)
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
      expect(service.getIsPaid()).toBe(false)
    })

    // Positive
    test('TC-016: Apply nominal discount', () => {
      const service = new PaymentService(100)
      service.applyDiscount(20)
      expect(service.getAmount()).toBe(80)
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
      expect(() => service.applyDiscount(20)).not.toThrow()
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(true)
    })

    // Negative
    test('TC-019: Ignore discount when percentage is NaN', () => {
      const service = new PaymentService(100)
      service.applyDiscount(NaN)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })

    test('TC-020: Ignore discount when percentage is Infinity', () => {
      const service = new PaymentService(100)
      service.applyDiscount(Infinity)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })

    test('TC-021: Ignore discount when percentage is a string', () => {
      const service = new PaymentService(100)
      // Wrong type forced past TypeScript to simulate runtime input
      const invalidPercent = '20' as unknown as number
      service.applyDiscount(invalidPercent)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })

    test('TC-022: Ignore discount when percentage is undefined', () => {
      const service = new PaymentService(100)
      const missingPercent = undefined as unknown as number
      service.applyDiscount(missingPercent)
      expect(service.getAmount()).toBe(100)
      expect(service.getIsPaid()).toBe(false)
    })

    // Data-driven: one result per input. JavaScript coerces [20] to 20
    // and true to 1, so a plain range check would apply the discount
    test.each([
      { label: 'object', invalidPercent: { percent: 50 } },
      { label: 'array', invalidPercent: [20] },
      { label: 'boolean', invalidPercent: true },
      { label: 'function', invalidPercent: () => 50 },
    ])(
      'TC-023: Ignore discount when percentage is a non-number type ($label)',
      ({ invalidPercent }) => {
        const service = new PaymentService(100)
        service.applyDiscount(invalidPercent as unknown as number)
        expect(service.getAmount()).toBe(100)
        expect(service.getIsPaid()).toBe(false)
      },
    )
  })

  // 003. PAY
  describe('pay', () => {
    // Positive
    test('TC-024: Return true and set isPaid to true on first call', () => {
      const service = new PaymentService(100)
      expect(service.pay()).toBe(true)
      expect(service.getIsPaid()).toBe(true)
    })

    test('TC-025: Return false on duplicate payment attempt', () => {
      const service = new PaymentService(100)
      service.pay()
      expect(service.pay()).toBe(false)
      expect(service.getIsPaid()).toBe(true)
      expect(service.getAmount()).toBe(100)
    })
  })
})
