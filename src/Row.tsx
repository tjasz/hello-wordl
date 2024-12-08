import { Clue, clueClass, CluedLetter, clueWord, obscureClue } from "./clue";

export enum RowState {
  LockedIn,
  Editing,
  Pending,
}

interface RowProps {
  rowState: RowState;
  wordLength: number;
  cluedLetters: CluedLetter[];
  annotation?: string;
  letterInfo: Map<string, CluedLetter>;
}

export function Row(props: RowProps) {
  let obscuredClue = obscureClue(props.cluedLetters);
  const isLockedIn = props.rowState === RowState.LockedIn;
  const isEditing = props.rowState === RowState.Editing;

  let numberElsewhere = 0;
  let numberCorrect = 0;
  if (isLockedIn) {
    numberElsewhere = obscuredClue.get(Clue.Elsewhere) ?? 0;
    numberCorrect = obscuredClue.get(Clue.Correct) ?? 0;
  }

  const letterDivs = props.cluedLetters
    .concat(Array(props.wordLength).fill({ clue: Clue.Absent, letter: "", index: -1 }))
    .slice(0, props.wordLength)
    .map(({ clue, letter, index }, i) => {
      let letterClass = "Row-letter";
      if (isLockedIn && clue !== undefined) {
        const thisLetterInfo = props.letterInfo.get(letter);
        const letterInfoClue = thisLetterInfo?.clue ?? Clue.Unknown;
        if (letterInfoClue !== Clue.Correct || thisLetterInfo?.index === i) {
          letterClass += " " + clueClass(letterInfoClue);
        } else {
          letterClass += " " + clueClass(Clue.Elsewhere);
        }
      }
      return (
        <td
          key={i}
          className={letterClass}
          aria-live={isEditing ? "assertive" : "off"}
          aria-label={letter.toUpperCase()}
        >
          {letter}
        </td>
      );
    });
  let rowClass = "Row";
  if (isLockedIn) rowClass += " Row-locked-in";
  return (
    <tr className={rowClass}>
      {letterDivs}
      <td id="hint-elsewhere" className="Row-letter letter-elsewhere">{numberElsewhere}</td>
      <td id="hint-correct" className="Row-letter letter-correct">{numberCorrect}</td>
      {props.annotation && (
        <span className="Row-annotation">{props.annotation}</span>
      )}
    </tr>
  );
}
