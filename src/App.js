import { useState } from "react";

function App() {
  const [message, setMessage] = useState("Bob el alquilador");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-purple-700">{message}</h1>
      <button
        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition"
        onClick={() => setMessage("Hola !")}
      >
        Saludar
      </button>
    </div>
  );
}

export default App;
