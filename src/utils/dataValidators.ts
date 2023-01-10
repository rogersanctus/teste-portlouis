type Numeric = string | number

export function isValidNumber(input: unknown): input is number {
  return typeof input === 'number' && !isNaN(input)
}

function numberFromNumeric(input: Numeric) {
  if (!isValidNumber(input)) {
    return Number(input)
  }

  return input
}

export function isInteger(input: Numeric) {
  const numberInput = numberFromNumeric(input)

  return Number.isInteger(numberInput)
}

export function isPositive(input: Numeric) {
  const numberInput = numberFromNumeric(input)

  return numberInput >= 0
}

export function isFractionLike(input: string, fractionDigits = 2) {
  if (typeof input !== 'string') {
    return false
  }

  if (input.match(/^\d+[,.]\d+$/)) {
    const inputParts = input.split(/\d+[,.]/)

    if (inputParts.length >= 2) {
      const fractionDigitsPart = inputParts[1]

      if (fractionDigitsPart.length === fractionDigits) {
        return true
      }
    }
  }

  return false
}

export function isAlphaNumeric(input: string) {
  return input.match(/^[a-z0-9]+$/i) !== null
}
