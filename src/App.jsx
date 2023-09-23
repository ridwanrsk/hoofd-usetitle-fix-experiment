import { useState } from "react";
import { useTitle } from "./hoofd-fix";
import { useEffect } from "react";

function App() {
  const [fruit, setFruit] = useState();

  useTitle("🚫 Root - No fruit chosen");

  return (
    <>
      <TitlePreviewer />
      <h1>Choose a fruit!</h1>
      <div>
        <button onClick={() => setFruit()}>Reset</button>
        <button onClick={() => setFruit("apple")}>Apple</button>
        <button onClick={() => setFruit("banana")}>Banana</button>
      </div>
      {fruit === "apple" && <Apple />}
      {fruit === "banana" && <Banana />}
    </>
  );
}

function Apple() {
  useTitle("🍎 Child - Apple");
  const [isWormDisplayed, setIsWormDisplayed] = useState(false);
  return (
    <div style={{ background: "lightpink", padding: 16 }}>
      Hello from apple!
      <button onClick={() => setIsWormDisplayed((visible) => !visible)}>
        Toggle a worm!
      </button>
      {isWormDisplayed && <AppleWorm />}
    </div>
  );
}

function AppleWorm() {
  const [name, setName] = useState("Twisty");
  // NOTE: GC = Grand children
  useTitle(`🪱🍎 GC A - Worm ${name}`);
  return (
    <div style={{ background: "orange", padding: 16 }}>
      Hello from Worm {name}! His name is:
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}

function Banana() {
  useTitle("🍌 Child - Banana");
  const [isMonkeyDisplayed, setIsMonkeyDisplayed] = useState(
    !!localStorage.getItem("persisted-monkey")
  );

  useEffect(() => {
    if (isMonkeyDisplayed) localStorage.setItem("persisted-monkey", "true");
    else localStorage.removeItem("persisted-monkey");
  }, [isMonkeyDisplayed]);

  return (
    <div style={{ background: "yellow", padding: 16 }}>
      Hello from banana!
      <button onClick={() => setIsMonkeyDisplayed((visible) => !visible)}>
        Toggle the monkey!
      </button>
      {isMonkeyDisplayed && <BananaMonkey />}
    </div>
  );
}

function BananaMonkey() {
  const [name, setName] = useState("Tailsy");
  // NOTE: GC = Grand children
  useTitle(`🐒🍌 GC B - Banana Monkey ${name}`);
  return (
    <div style={{ background: "moccasin", padding: 16 }}>
      Hello from Monkey {name}! His name is:
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </div>
  );
}

function TitlePreviewer() {
  const [title, setTitle] = useState(document.title);
  useEffect(() => {
    const intervalId = setInterval(() => setTitle(document.title), 100);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <div style={{ background: "lightgray", padding: 16 }}>
      Current title: {title}
    </div>
  );
}

export default App;
