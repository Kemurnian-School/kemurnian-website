
export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const newArr = [...arr]
  const [moved] = newArr.splice(from, 1)
  newArr.splice(to, 0, moved)
  return newArr
}
