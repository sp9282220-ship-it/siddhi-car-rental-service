import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode">
      {dark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
