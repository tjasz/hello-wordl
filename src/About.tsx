import { Clue, CluedLetter } from "./clue";
import { Row, RowState } from "./Row";
import { gameName, maxGuesses } from "./util";

export function About() {
  return (
    <div className="App-about">
      <p>
        <i>{gameName}</i> is a remake of the word game{" "}
        <a href="https://www.powerlanguage.co.uk/wordle/">
          <i>Wordle</i>
        </a>{" "}
        by <a href="https://twitter.com/powerlanguish">powerlanguage</a>,
        but with the locations of the hints obscured.
      </p>
      <p>
        You get {maxGuesses} tries to guess a target word.
        <br />
        After each guess, you get Mastermind-style feedback.
      </p>
      <hr />
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        letterInfo={new Map<string, CluedLetter>()}
        cluedLetters={[
          { clue: Clue.Absent, letter: "h", index: -1 },
          { clue: Clue.Absent, letter: "o", index: -1 },
          { clue: Clue.Absent, letter: "u", index: -1 },
          { clue: Clue.Absent, letter: "n", index: -1 },
          { clue: Clue.Absent, letter: "d", index: -1 },
        ]}
      />
      <p>
        None of the letters in <strong>HOUND</strong> are in the target word.
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        letterInfo={new Map<string, CluedLetter>()}
        cluedLetters={[
          { clue: Clue.Absent, letter: "f", index: -1 },
          { clue: Clue.Absent, letter: "l", index: -1 },
          { clue: Clue.Absent, letter: "a", index: -1 },
          { clue: Clue.Elsewhere, letter: "s", index: -1 },
          { clue: Clue.Absent, letter: "h", index: -1 },
        ]}
      />
      <p>
        One of the letters in <strong>FLASH</strong> is in the target word,
        but in a different place.
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        letterInfo={new Map<string, CluedLetter>()}
        cluedLetters={[
          { clue: Clue.Correct, letter: "s", index: 0 },
          { clue: Clue.Correct, letter: "t", index: 1 },
          { clue: Clue.Correct, letter: "e", index: 2 },
          { clue: Clue.Elsewhere, letter: "r", index: -1 },
          { clue: Clue.Absent, letter: "n", index: -1 },
        ]}
      />
      <p>
        <b className={"green-bg"}>3</b> of the letters in <strong>STERN </strong>
        are in the correct place.
      </p>
      <p>
        <b className={"yellow-bg"}>1</b> other letter from <strong>STERN</strong> is in the target word,
        but in a different place.
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        letterInfo={new Map<string, CluedLetter>()}
        cluedLetters={[
          { clue: Clue.Correct, letter: "s", index: 0 },
          { clue: Clue.Correct, letter: "t", index: 1 },
          { clue: Clue.Correct, letter: "e", index: 2 },
          { clue: Clue.Correct, letter: "e", index: 3 },
          { clue: Clue.Correct, letter: "r", index: 4 },
        ]}
        annotation={"Got it!"}
      />
      <p>
        Report issues{" "}
        <a href="https://github.com/tjasz/obscurdle/issues">here</a>.
      </p>
      <p>
        This game will be free and ad-free forever,
        <br />
        but you can <a href="https://ko-fi.com/chordbug">buy me a coffee</a> if
        you'd like.
      </p>
    </div>
  );
}
