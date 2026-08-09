import { useEffect, useState } from 'react';
import { FaFish } from 'react-icons/fa';
import { FiMoon, FiSun } from 'react-icons/fi';

function readTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function Header() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('cc-theme', theme);
    } catch {
      // storage unavailable (private mode) — the theme still applies for this visit
    }
  }, [theme]);

  return (
    <nav className="nav">
      <div className="wrap nav__inner">
        <a className="brand" href="#top">
          <span className="brand__mark">
            <FaFish />
          </span>
          <span>
            <span className="brand__name">Casting Clock</span>
            <span className="brand__tag">Read the water</span>
          </span>
        </a>

        <div className="nav__right">
          <a className="nav__link" href="#map">
            Map
          </a>
          <a className="nav__link" href="#readings">
            Readings
          </a>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={
              theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
            }
            title={
              theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
            }
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Header;
