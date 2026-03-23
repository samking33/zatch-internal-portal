import React from 'react';
import { Link } from 'react-router-dom';

type BrandingOptions = {
  logo?: string;
  companyName?: string;
};

type SidebarBrandingProps = {
  branding: BrandingOptions;
};

const SidebarBranding = ({ branding }: SidebarBrandingProps) => (
  <Link
    to="/admin"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 20px',
      textDecoration: 'none',
      borderBottom: '1px solid #3c4f63',
      background: '#243040',
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {branding.logo ? (
        <img
          src={branding.logo}
          alt={branding.companyName ?? 'Admin'}
          style={{
            width: 40,
            height: 40,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : null}
    </div>
    <div
      style={{
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}
    >
      {branding.companyName ?? 'Admin'}
    </div>
  </Link>
);

export default SidebarBranding;
