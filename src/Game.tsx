import { useEffect, useRef, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, CluedLetter, describeClue, expectedLetterInfo, obscureClue, violation } from "./clue";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import {
  describeSeed,
  dictionarySet,
  gameName,
  pick,
  resetRng,
  seed,
  speak,
  urlParam,
  ValidationLevel,
} from "./util";
import { decode, encode } from "./base64";
import useSetting from "./useSetting"

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
  colorBlind: boolean;
  keyboardLayout: string;
}

const targets = targetList.slice(0, targetList.indexOf("murky") + 1); // Words no rarer than this one
const minLength = 4;
const defaultLength = 5;
const maxLength = 11;
const limitLength = (n: number) =>
  n >= minLength && n <= maxLength ? n : defaultLength;

function randomTarget(wordLength: number): string {
  const eligible = targets.filter((word) => word.length === wordLength);
  let candidate: string;
  do {
    candidate = pick(eligible);
  } while (/\*/.test(candidate));
  return candidate;
}

function getChallengeUrl(target: string): string {
  return (
    window.location.origin +
    window.location.pathname +
    "?challenge=" +
    encode(target)
  );
}

let initChallenge = "";
let challengeError = false;
try {
  initChallenge = decode(urlParam("challenge") ?? "").toLowerCase();
} catch (e) {
  console.warn(e);
  challengeError = true;
}
if (initChallenge && !dictionarySet.has(initChallenge)) {
  initChallenge = "";
  challengeError = true;
}

function parseUrlLength(): number {
  const lengthParam = urlParam("length");
  if (!lengthParam) return defaultLength;
  return limitLength(Number(lengthParam));
}

function parseUrlGameNumber(): number {
  const gameParam = urlParam("game");
  if (!gameParam) return 1;
  const gameNumber = Number(gameParam);
  return gameNumber >= 1 && gameNumber <= 1000 ? gameNumber : 1;
}

function Game(props: GameProps) {
  const [validationLevel, setValidationLevel] = useSetting<number>("validation", 0);
  const [challenge, setChallenge] = useState<string>(initChallenge);
  const [wordLength, setWordLength] = useState(
    challenge ? challenge.length : parseUrlLength()
  );
  const [gameNumber, setGameNumber] = useState(parseUrlGameNumber());
  const [guesses, setGuesses] = useState<string[]>(
    !challenge && seed && gameNumber <= 1
      ? JSON.parse(window.localStorage.getItem(`${seed}-guesses`) ?? "[]")
      : []
  );
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [target, setTarget] = useState(() => {
    resetRng();
    // Skip RNG ahead to the parsed initial game number:
    for (let i = 1; i < gameNumber; i++) randomTarget(wordLength);
    return challenge || randomTarget(wordLength);
  });
  const [gameState, setGameState] = useState(
    guesses.includes(target)
      ? GameState.Won
      : guesses.length > props.maxGuesses
        ? GameState.Lost
        : GameState.Playing
  );
  const [hint, setHint] = useState<string>(
    gameState === GameState.Playing
      ? challengeError
        ? `Invalid challenge string, playing random game.`
        : `Make your first guess!`
      : "Press enter to play a random game"
  );
  const currentSeedParams = () =>
    urlParam("today") !== null ? "" : `?random`;
  useEffect(() => {
    if (seed && urlParam("today") === null && !challenge) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + currentSeedParams()
      );
    }
  }, [wordLength, gameNumber]);

  const tableRef = useRef<HTMLTableElement>(null);
  const startNextGame = () => {
    if (challenge) {
      // Clear the URL parameters:
      window.history.replaceState({}, document.title, window.location.pathname + "?today");
    } else {
      window.history.replaceState({}, document.title, window.location.pathname + "?random");
    }
    setChallenge("");
    const newWordLength = limitLength(wordLength);
    setWordLength(newWordLength);
    setTarget(randomTarget(newWordLength));
    setHint("");
    setGuesses([]);
    setCurrentGuess("");
    setGameState(GameState.Playing);
    setGameNumber((x) => x + 1);
  };

  async function share(copiedHint: string, text?: string) {
    const url = seed && gameNumber <= 1
      ? window.location.origin + window.location.pathname + currentSeedParams()
      : getChallengeUrl(target);
    const body = url + (text ? "\n\n" + text : "");
    if (
      /android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) &&
      !/firefox/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({ text: body });
        return;
      } catch (e) {
        console.warn("navigator.share failed:", e);
      }
    }
    try {
      await navigator.clipboard.writeText(body);
      setHint(copiedHint);
      return;
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed:", e);
    }
    setHint(url);
  }

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      tableRef.current?.focus();
      setHint("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Too short");
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Not a valid word");
        return;
      }
      for (const g of guesses) {
        const c = clue(g, target);
        const feedback = violation(validationLevel, c, g, currentGuess);
        if (feedback) {
          setHint(feedback);
          return;
        }
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      if (!challenge && seed && gameNumber <= 1) {
        window.localStorage.setItem(`${seed}-guesses`, JSON.stringify(guesses.concat([currentGuess])));
      }
      setCurrentGuess((guess) => "");

      const gameOver = (verbed: string) =>
        `You ${verbed}! The answer was ${target.toUpperCase()}. (Enter to ${challenge ? "play today's game" : "play a random game"
        })`;

      if (currentGuess === target) {
        setHint(gameOver("won"));
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(gameOver("lost"));
        setGameState(GameState.Lost);
      } else {
        setHint("");
        speak(describeClue(clue(currentGuess, target)));
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState]);

  let letterInfo = new Map<string, CluedLetter>();
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const obscuredClue = obscureClue(cluedLetters);
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        const expectedInfo = expectedLetterInfo(guess, letterInfo);
        console.log({ guess, expectedInfo, obscuredClue, letterInfo })
        // if we only get the expected number of correct letters, none of the others are in the target
        if ((obscuredClue.get(Clue.Correct) ?? 0) + (obscuredClue.get(Clue.Elsewhere) ?? 0) ===
          (expectedInfo.get(Clue.Correct) ?? 0) + (expectedInfo.get(Clue.Elsewhere) ?? 0)) {
          for (const { clue, letter } of cluedLetters) {
            letterInfo.set(letter, { clue: Clue.Absent, letter, index: -1 });
          }
        }
        // if all the previously unknown letters in the guess are in the target
        if ((expectedInfo.get(Clue.Unknown) ?? 0) + (expectedInfo.get(Clue.Correct) ?? 0) + (expectedInfo.get(Clue.Elsewhere) ?? 0) ===
          (obscuredClue.get(Clue.Correct) ?? 0) + (obscuredClue.get(Clue.Elsewhere) ?? 0)) {
          for (const { clue, letter } of cluedLetters) {
            if ((letterInfo.get(letter)?.clue ?? Clue.Unknown) === Clue.Unknown) {
              letterInfo.set(letter, { clue: Clue.Elsewhere, letter, index: -1 });
            }
          }
        }
        // if all the previously unknown letters in the guess are in the correct spot
        if ((expectedInfo.get(Clue.Unknown) ?? 0) + (expectedInfo.get(Clue.Correct) ?? 0) + (expectedInfo.get(Clue.Elsewhere) ?? 0) ===
          (obscuredClue.get(Clue.Correct) ?? 0)) {
          for (const { clue, letter, index } of cluedLetters) {
            if ((letterInfo.get(letter)?.clue ?? Clue.Unknown) === Clue.Unknown || (letterInfo.get(letter)?.clue ?? Clue.Unknown) === Clue.Elsewhere) {
              letterInfo.set(letter, { clue: Clue.Correct, letter, index });
            }
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length
                ? RowState.Editing
                : RowState.Pending
          }
          cluedLetters={cluedLetters}
          letterInfo={letterInfo}
        />
      );
    });

  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <table
        className="Game-rows"
        tabIndex={0}
        aria-label="Table of guesses"
        ref={tableRef}
      >
        <tbody>{tableRows}</tbody>
      </table>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? "text" : "none",
          whiteSpace: "pre-wrap",
        }}
      >
        {hint || `\u00a0`}
      </p>
      <div>
        <label htmlFor="validation-level-setting">Validation Level: </label>
        <input type="button"
          value={["Normal", "Strict"][validationLevel]}
          onClick={(e) => setValidationLevel((validationLevel + 1) % (ValidationLevel.Strict + 1))}
        />
        <div
          style={{
            display: "none",
            fontSize: 14,
            height: 40,
            marginLeft: 8,
            marginTop: 8,
          }}
        >
          {
            [
              `Guesses must be valid dictionary words.`,
              `Guesses must use information from previous hints.`,
            ][validationLevel]
          }
        </div>
      </div>
      <Keyboard
        layout={props.keyboardLayout}
        letterInfo={letterInfo}
        onKey={onKey}
      />
      <div className="Game-seed-info">
        {challenge
          ? "playing a challenge game"
          : seed && gameNumber <= 1
            ? `${describeSeed(seed)}`
            : "playing a random game"}
      </div>
      <p>
        <button
          onClick={() => {
            share("Link copied to clipboard!");
          }}
        >
          Share a link to this game
        </button>{" "}
        {gameState !== GameState.Playing && (
          <button
            onClick={() => {
              const score = gameState === GameState.Lost ? "X" : guesses.length;
              share(
                "Result copied to clipboard!",
                `${gameName} ${seed && gameNumber <= 1 ? describeSeed(seed) : ""}: ${score}/${props.maxGuesses}\n` +
                guesses
                  .map(function (guess) {
                    const oc = obscureClue(clue(guess, target));
                    return `${oc.get(Clue.Elsewhere) ?? 0}-${oc.get(Clue.Correct) ?? 0}`
                  }
                  )
                  .join("\n")
              );
            }}
          >
            Share results
          </button>
        )}
      </p>
    </div>
  );
}

export default Game;
