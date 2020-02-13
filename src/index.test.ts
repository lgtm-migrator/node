jest.mock('./load')
jest.mock('./validate')
jest.mock('./options/validate-options')

import { load } from './load'
import { validate } from './validate'
import validateOptions from './options/validate-options'
import { defaultOptions } from './options'

const mockedLoad = load as jest.MockedFunction<typeof load>
const mockedValidate = validate as jest.MockedFunction<typeof validate>
const mockedValidateOptions = validateOptions as jest.MockedFunction<
  typeof validateOptions
>

const runtimeEnv = process.env.NODE_ENV || 'test'
const mockedConfig = { some: 'config', runtimeEnv }
const mockedOptions = defaultOptions
const mockedValidationResult = true
mockedLoad.mockReturnValue(mockedConfig)
mockedValidate.mockReturnValue(mockedValidationResult)
mockedValidateOptions.mockReturnValue(mockedOptions)

import StrongConfig from '.'

describe('StrongConfig class', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('instantiation', () => {
    it('can be instantiated without constructor arguments', () => {
      expect(new StrongConfig()).toBeDefined()
    })

    it('can be instantiated with a options object', () => {
      expect(new StrongConfig(mockedOptions)).toBeDefined()
    })

    it('validates the options object', () => {
      new StrongConfig(mockedOptions)

      expect(mockedValidateOptions).toHaveBeenCalledWith(mockedOptions)
    })

    it('stores the validated options object', () => {
      const strongConfig = new StrongConfig(mockedOptions)

      expect(strongConfig.options).toStrictEqual(mockedOptions)
    })
  })

  it('strongConfig instance exposes "load()"', () => {
    expect(new StrongConfig().load).toBeInstanceOf(Function)
  })

  it('strongConfig instance exposes "validate()"', () => {
    expect(new StrongConfig().validate).toBeInstanceOf(Function)
  })

  describe('strongConfig.load()', () => {
    it('calls imported load() and returns its result', () => {
      const strongConfig = new StrongConfig()

      const result = strongConfig.load()

      expect(mockedLoad).toHaveBeenCalledTimes(1)
      expect(result).toStrictEqual(mockedConfig)
    })

    it('calls imported load() with initialized options', () => {
      const strongConfig = new StrongConfig(mockedOptions)

      strongConfig.load()

      expect(mockedLoad).toHaveBeenCalledWith(runtimeEnv, mockedOptions)
    })

    it('memoizes previously loaded config', () => {
      const strongConfig = new StrongConfig()

      const firstLoadResult = strongConfig.load()
      const secondLoadResult = strongConfig.load()

      expect(mockedLoad).toHaveBeenCalledTimes(1)
      expect(firstLoadResult).toStrictEqual(mockedConfig)
      expect(secondLoadResult).toStrictEqual(mockedConfig)
    })

    it('throws if runtimeEnv is not set', () => {
      delete process.env[defaultOptions.runtimeEnvName]
      const strongConfig = new StrongConfig({
        ...defaultOptions,
        runtimeEnvName: undefined,
      })
      expect(() => strongConfig.load()).toThrow('runtimeEnv must be defined')
      process.env[defaultOptions.runtimeEnvName] = runtimeEnv
    })
  })

  describe('strongConfig.validate()', () => {
    it('calls imported validate() and returns its result', () => {
      const strongConfig = new StrongConfig()

      const result = strongConfig.validate()

      expect(mockedValidate).toHaveBeenCalledTimes(1)
      expect(mockedValidate).toHaveBeenCalledWith(
        runtimeEnv,
        mockedOptions.configRoot
      )
      expect(result).toStrictEqual(mockedValidationResult)
    })
  })
})
