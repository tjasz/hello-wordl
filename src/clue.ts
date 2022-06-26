import { Difficulty, englishNumbers, ordinal } from "./util";

export enum Clue {
  Unknown,
  Absent,
  Elsewhere,
  Correct,
}

export interface CluedLetter {
  clue?: Clue;
  letter: string;
}

export function clue(word: string, target: string): CluedLetter[] {
  let elusive: string[] = [];
  target.split("").forEach((letter, i) => {
    if (word[i] !== letter) {
      elusive.push(letter);
    }
  });
  return word.split("").map((letter, i) => {
    let j: number;
    if (target[i] === letter) {
      return { clue: Clue.Correct, letter };
    } else if ((j = elusive.indexOf(letter)) > -1) {
      // "use it up" so we don't clue at it twice
      elusive[j] = "";
      return { clue: Clue.Elsewhere, letter };
    } else {
      return { clue: Clue.Absent, letter };
    }
  });
}

export function obscureClue(cluedLetters : CluedLetter[]) : Map<Clue, number>{
  let obscured = new Map<Clue, number>();
  for (const { clue, letter } of cluedLetters) {
    if (clue === undefined) continue;
    obscured.set(clue, 1 + (obscured.get(clue) ?? 0));
  }
  return obscured;
}

export function clueClass(clue: Clue): string {
  if (clue === Clue.Unknown) {
    return "letter-unknown";
  } else if (clue === Clue.Absent) {
    return "letter-absent";
  } else if (clue === Clue.Elsewhere) {
    return "letter-elsewhere";
  } else {
    return "letter-correct";
  }
}

export function clueWord(clue: Clue): string {
  if (clue === Clue.Unknown) {
    return "unknown";
  } else if (clue === Clue.Absent) {
    return "no";
  } else if (clue === Clue.Elsewhere) {
    return "elsewhere";
  } else {
    return "correct";
  }
}

export function describeClue(clue: CluedLetter[]): string {
  return clue
    .map(({ letter, clue }) => letter.toUpperCase() + " " + clueWord(clue!))
    .join(", ");
}

export function violation(
  difficulty: Difficulty,
  clues: CluedLetter[],
  pastGuess: string,
  guess: string
): string | undefined {
  if (difficulty === Difficulty.Normal) {
    return undefined;
  }
  let i = 0;

  // Guesses should have the right amount of letters from each clue
  const obscured = obscureClue(clues);
  const inCommon = obscureClue(clue(guess, pastGuess));
  const numberFromClueInTarget = ((obscured.get(Clue.Elsewhere) ?? 0) + (obscured.get(Clue.Correct) ?? 0));
  const numberFromClueInGuess = ((inCommon.get(Clue.Elsewhere) ?? 0) + (inCommon.get(Clue.Correct) ?? 0));
  const sharesCorrectAmount = numberFromClueInTarget == numberFromClueInGuess;
  if (!sharesCorrectAmount) {
    return `Guess must share ${numberFromClueInTarget < numberFromClueInGuess ? "only " : ""}${numberFromClueInTarget} letter${numberFromClueInTarget !== 1 ? "s" : ""} with '${pastGuess.toUpperCase()}'.`;
  }
  // Also obey Correct clues
  const numberCorrectInClue = obscured.get(Clue.Correct) ?? 0;
  const numberMatchedInGuess = inCommon.get(Clue.Correct) ?? 0;
  if (numberMatchedInGuess != numberCorrectInClue) {
    return `Guess must have ${numberCorrectInClue < numberMatchedInGuess ? "only " : ""}${numberCorrectInClue} letter${numberCorrectInClue !== 1 ? "s" : ""} in the same place as in '${pastGuess.toUpperCase()}'.`;
  }
  return undefined;
}
