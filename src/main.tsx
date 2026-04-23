import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/fraunces/900.css";

createRoot(document.getElementById("root")!).render(<App />);
