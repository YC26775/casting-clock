import { useEffect, useState } from 'react';
import { FaFish } from 'react-icons/fa';
import { FiInfo, FiMoon, FiSun } from 'react-icons/fi';
import InfoDialog from './InfoDialog';
import SiteSearch from './SiteSearch';

function readTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/*
 * Floating "HUD" that sits over the full-bleed map: brand + search top-left,
 * theme toggle top-right. The row itself has no background — only its
 * children are clickable — so the map stays reachable everywhere else.
 */
function Header({ onSearch, resultCount }) {
  const [theme, setTheme] = useState(readTheme);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('cc-theme', theme);
    } catch {
      // storage unavailable (private mode) — the theme still applies for this visit
    }
  }, [theme]);

  return (
    <>
      <div className="hud">
        <div className="hud__left">
          <div className="brand-chip">
            <span className="brand__mark" aria-hidden="true">
              <FaFish />
            </span>
            <span className="brand-chip__name">Casting Clock</span>
          </div>

          <SiteSearch onSearch={onSearch} resultCount={resultCount} />
        </div>

        <div className="hud__right">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setInfoOpen(true)}
            aria-label="About Casting Clock"
            title="About Casting Clock"
          >
            <FiInfo />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
            title={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>

      {/* Outside .hud on purpose: that row sets pointer-events:none for the
          map underneath it, which any dialog nested inside would inherit. */}
      <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}

export default Header;
