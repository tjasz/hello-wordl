import { Clue } from "./clue";
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
        letterInfo={new Map<string, Clue>()}
        cluedLetters={[
          { clue: Clue.Absent, letter: "h" },
          { clue: Clue.Absent, letter: "o" },
          { clue: Clue.Absent, letter: "u" },
          { clue: Clue.Absent, letter: "n" },
          { clue: Clue.Absent, letter: "d" },
        ]}
      />
      <p>
        None of the letters in <strong>HOUND</strong> are in the target word.
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        letterInfo={new Map<string, Clue>()}
        cluedLetters={[
          { clue: Clue.Absent, letter: "f" },
          { clue: Clue.Absent, letter: "l" },
          { clue: Clue.Absent, letter: "a" },
          { clue: Clue.Elsewhere, letter: "s" },
          { clue: Clue.Absent, letter: "h" },
        ]}
      />
      <p>
        One of the letters in <strong>FLASH</strong> is in the target word,
        but in a different place.
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        letterInfo={new Map<string, Clue>()}
        cluedLetters={[
          { clue: Clue.Correct, letter: "s" },
          { clue: Clue.Correct, letter: "t" },
          { clue: Clue.Correct, letter: "e" },
          { clue: Clue.Elsewhere, letter: "r" },
          { clue: Clue.Absent, letter: "n" },
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
        letterInfo={new Map<string, Clue>()}
        cluedLetters={[
          { clue: Clue.Correct, letter: "s" },
          { clue: Clue.Correct, letter: "t" },
          { clue: Clue.Correct, letter: "e" },
          { clue: Clue.Correct, letter: "e" },
          { clue: Clue.Correct, letter: "r" },
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
