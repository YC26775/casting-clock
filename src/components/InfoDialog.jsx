import { useEffect } from 'react';
import { FaFish } from 'react-icons/fa';
import { FiExternalLink, FiX } from 'react-icons/fi';

function InfoDialog({ open, onClose }) {
  const currentYear = new Date().getFullYear();

  // Close on Escape, and stop the page from scrolling behind the dialog.
  useEffect(() => {
    if (!open) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="icon-btn modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX />
        </button>

        <div className="modal__brand">
          <span className="brand__mark" aria-hidden="true">
            <FaFish />
          </span>
          <h2 id="info-dialog-title">Casting Clock</h2>
        </div>

        <p className="modal__lede">
          Casting Clock pulls live streamflow straight from USGS gauges and
          pairs it with on-the-water weather, then measures both against the
          five-year seasonal normal — so you can tell a good day from a wasted
          drive. Search a state, pick any gauge on the map, and its flow,
          height and weather stack up in the readings panel.
        </p>

        <div className="modal__footer">
          <p className="footer__note">
            © {currentYear} · Conditions are guidance, not a guarantee —
            always check local advisories before you wade.
          </p>

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
      </div>
    </div>
  );
}

export default InfoDialog;
