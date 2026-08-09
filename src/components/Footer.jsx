import { FaFish } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div>
          <p className="footer__brand">
            <FaFish />
            Casting Clock
          </p>
          <p className="footer__note">
            © {currentYear} · Conditions are guidance, not a guarantee — always
            check local advisories before you wade.
          </p>
        </div>

        <div className="footer__links">
          <a
            href="https://waterdata.usgs.gov/nwis"
            target="_blank"
            rel="noreferrer"
          >
            USGS Water Data <FiExternalLink />
          </a>
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer">
            Open-Meteo <FiExternalLink />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
