import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/fraunces/700.css";
import "@fontsource/fraunces/900.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(<App />);
