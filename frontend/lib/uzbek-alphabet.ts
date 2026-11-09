/** Official Uzbek Latin alphabet. `key` matches the backend's `letter` parameter. */
export const UZBEK_ALPHABET = [
  ["a", "A"],
  ["b", "B"],
  ["d", "D"],
  ["e", "E"],
  ["f", "F"],
  ["g", "G"],
  ["h", "H"],
  ["i", "I"],
  ["j", "J"],
  ["k", "K"],
  ["l", "L"],
  ["m", "M"],
  ["n", "N"],
  ["o", "O"],
  ["p", "P"],
  ["q", "Q"],
  ["r", "R"],
  ["s", "S"],
  ["t", "T"],
  ["u", "U"],
  ["v", "V"],
  ["x", "X"],
  ["y", "Y"],
  ["z", "Z"],
  ["o'", "Oʻ"],
  ["g'", "Gʻ"],
  ["sh", "Sh"],
  ["ch", "Ch"],
  ["ng", "Ng"],
].map(([key, label]) => ({ key: key as string, label: label as string }));

export function isUzbekLetter(value: string | null): value is string {
  return (
    value !== null && UZBEK_ALPHABET.some((letter) => letter.key === value)
  );
}
