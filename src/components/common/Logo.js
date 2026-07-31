import React from 'react';
import './Logo.css';

// Two "sibling" logo marks sharing the exact same artwork/shape:
// - logo-icon-light.png : dark charcoal ink, for use on light backgrounds
// - logo-icon-dark.png  : silver/chrome, for use on dark backgrounds
// CSS (driven by the [data-theme="dark"] attribute on <html>) shows/hides
// the right one, so the logo stays crisp and readable in both modes.
export const Logo = ({ size = 28, className = '' }) => (
  <span
    className={`logo-mark ${className}`}
    style={{ width: size, height: size }}
  >
    <img
      src="logo-icon-light.png"
      alt="SECTiON Logo"
      className="logo-mark-img logo-mark-for-light"
      width={size}
      height={size}
    />
    <img
      src="logo-icon-dark.png"
      alt="SECTiON Logo"
      className="logo-mark-img logo-mark-for-dark"
      width={size}
      height={size}
    />
  </span>
);

export default Logo;
