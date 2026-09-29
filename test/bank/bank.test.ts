import { Bank } from '../../src/bank/bank'

describe('Bank', () => {
  let bank: Bank

  beforeEach(() => {
    bank = new Bank()
  })

  describe('deposit', () => {
    test('increases balance by the specified amount', () => {
      bank.deposit(100)
      expect(bank.getBalance()).toBe(100)

      bank.deposit(50)
      expect(bank.getBalance()).toBe(150)
    })

    test('decrease balance by the specified amount', () => {
      bank.deposit(100)
      bank.withdraw(50)
      expect(bank.getBalance()).toBe(50)
    })

    test('verify enough balance', () => {
      bank.deposit(26)
      expect(bank.hasEnoughBalance()).toBeTruthy()
    })

    test('verify enough balance', () => {
      bank.deposit(24)
      expect(bank.hasEnoughBalance()).toBeFalsy()
    })
    // TODO: withdraw tests to increase coverage according to the threshold
  })
})
