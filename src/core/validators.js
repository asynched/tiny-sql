class BaseValidator {
  validate(_value) {}
}

export class IntegerValidator extends BaseValidator {
  validate(value) {
    return Number.isInteger(value)
  }
}

export class FloatValidator extends BaseValidator {
  validate(value) {
    return Number.isFinite(value)
  }
}

export class VariableCharValidator extends BaseValidator {
  validate(value) {
    return typeof value === 'string'
  }
}

export class BooleanValidator extends BaseValidator {
  validate(value) {
    return typeof value === 'boolean'
  }
}

export const validatorMap = {
  INTEGER: IntegerValidator,
  FLOAT: FloatValidator,
  VARCHAR: VariableCharValidator,
  BOOLEAN: BooleanValidator,
}
