import React from 'react';
import { Link } from 'react-router-dom';
import brandMark from '../assets/brand/taklifnoma-mark.png';

const BrandLogo = ({
  to = '/',
  asLink = true,
  iconClassName = '',
  badgeClassName = '',
  wordmarkClassName = '',
  accentClassName = '',
  subtitle = '',
  subtitleClassName = '',
  showSubtitle = false,
  showWordmark = true,
}) => {
  const content = (
    <div className="flex items-center gap-3">
      {showWordmark && (
        <div className="flex min-w-0 flex-col">
          <span
            className={`relative text-[1.1rem] sm:text-[1.25rem] font-black uppercase tracking-[-0.05em] text-emerald-950 whitespace-nowrap ml-2 sm:ml-0 ${wordmarkClassName}`}
          >
            Taklifnoma<span className={`text-[1em] text-gold-500 leading-none ${accentClassName}`}>.vip</span>
          </span>
          {showSubtitle && subtitle ? (
            <span
              className={`text-[9px] font-black uppercase tracking-[3px] text-emerald-900/35 ${subtitleClassName}`}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );

  if (!asLink) {
    return content;
  }

  return (
    <Link to={to} className="inline-flex items-center">
      {content}
    </Link>
  );
};

export default BrandLogo;
