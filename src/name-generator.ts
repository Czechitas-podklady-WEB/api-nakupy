const privlastky = [
  "Malá",
  "Milá",
  "Rychlá",
  "Hodná",
  "Hbitá",
  "Mrštná",
  "Vtipná",
  "Chytrá",
  "Krásná",
  "Pracovitá",
  "Veselá",
  "Zadumaná",
];
const zvirata = [
  "veverka",
  "liška",
  "užovka",
  "hvězdice",
  "medvědice",
  "žirafa",
  "žížala",
  "žába",
  "ryba",
  "laň",
  "srna",
  "lvice",
  "tygřice",
];

const createRandomIndex= <T>(array: T[]): number => Math.floor(Math.random() * array.length);
const getRandomItem = <T>(array: T[]): T => array[createRandomIndex(array)];

export const generateName = (): string => getRandomItem(privlastky) + " " + getRandomItem(zvirata);
