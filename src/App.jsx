import { useState } from "react";
import { useTitle } from "./hoofd-fix";
import { useEffect } from "react";

function App() {
  const [fruit, setFruit] = useState();

  useTitle("🚫 No fruit chosen");

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
  useTitle("🍎 Apple");
  return (
    <div style={{ background: "lightpink", padding: 16 }}>Hello from apple!</div>
  );
}

function Banana() {
  useTitle("🍌 Banana");
  return (
    <div style={{ background: "yellow", padding: 16 }}>Hello from banana!</div>
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
