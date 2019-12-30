export function convertToMs(
  num: number,
  type: 'seconds' | 'minutes' | 'hours',
): number {
  switch (type) {
    case 'seconds':
      return num * 1000
    case 'minutes':
      return num * 60000
    case 'hours':
      return num * 36000000
    default:
      return 0
  }
}
