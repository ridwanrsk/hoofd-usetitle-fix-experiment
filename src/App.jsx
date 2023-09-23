import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Init counter: {count}</h1>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </>
  );
}

export default App;
