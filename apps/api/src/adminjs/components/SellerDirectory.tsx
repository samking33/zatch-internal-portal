import React, { useMemo, useState } from 'react';

import type { AdminSellerRecord, SellerDirectoryPayload } from '../types';
import {
  Badge,
  ErrorState,
  LoadingState,
  cardStyle,
  formatDateTime,
  pageStyle,
  sectionHeaderStyle,
  sectionSubtitleStyle,
  sectionTitleStyle,
  statusColors,
  usePageData,
} from './shared';

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  padding: '10px 12px',
  fontSize: 13,
  color: '#1f2937',
  boxSizing: 'border-box',
};

const statusButtonStyle = (active: boolean): React.CSSProperties => ({
  borderRadius: 999,
  border: `1px solid ${active ? '#3b82f6' : '#d1d5db'}`,
  background: active ? '#3b82f6' : '#ffffff',
  color: active ? '#ffffff' : '#374151',
  fontWeight: 600,
  fontSize: 12,
  padding: '7px 12px',
  cursor: 'pointer',
});

const tableHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#6b7280',
  fontWeight: 600,
  padding: '12px 16px',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
};

const tableCellStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid #eef2f7',
  verticalAlign: 'top',
  fontSize: 13,
  color: '#1f2937',
};

const detailGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#9ca3af',
  fontWeight: 700,
};

const detailValueStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#1f2937',
};

const getProfilePicUrl = (seller: AdminSellerRecord): string | null => seller.upstream.profilePicUrl ?? null;

const buildInitials = (label: string): string =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const SellerDirectory = () => {
  const { data, loading, error } = usePageData<SellerDirectoryPayload>('sellers');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    return data.sellers.filter((seller) => {
      if (status !== 'all' && seller.status !== status) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        seller.sellerName,
        seller.businessName,
        seller.email,
        seller.phone,
        seller.gstOrEnrollmentId,
        seller.location.city,
        seller.location.state,
        seller.upstream.username ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [data, query, status]);

  const selectedSeller =
    filtered.find((seller) => seller.id === selectedId) ??
    data?.sellers.find((seller) => seller.id === selectedId) ??
    filtered[0] ??
    null;
  const selectedDetail = selectedSeller ? data?.details[selectedSeller.id] ?? null : null;

  if (loading) {
    return <LoadingState label="Loading sellers..." />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Seller data is unavailable'} />;
  }

  return (
    <div style={pageStyle}>
      <section style={{ ...cardStyle, padding: 24 }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1f2937' }}>Sellers</h1>
            <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
              Read-only seller directory powered by the upstream Zatch seller source.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge label={`${data.stats.total} total`} background="#dbeafe" color="#1d4ed8" />
            <Badge label={`${data.stats.pending} pending`} background="#fef3c7" color="#92400e" />
            <Badge label={`${data.stats.approved} approved`} background="#d1fae5" color="#065f46" />
            <Badge label={`${data.stats.rejected} rejected`} background="#fee2e2" color="#991b1b" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) auto', gap: 12, alignItems: 'center' }}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, business, email, GST, city, or username"
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((value) => (
              <button key={value} type="button" onClick={() => setStatus(value)} style={statusButtonStyle(status === value)}>
                {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 1fr)', gap: 20, alignItems: 'start' }}>
        <section style={{ ...cardStyle, overflow: 'hidden' }}>
          <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={sectionTitleStyle}>Directory</h2>
            <p style={sectionSubtitleStyle}>Same seller queue style as the ops portal, with full upstream detail on selection.</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={tableHeaderStyle}>Seller</th>
                  <th style={tableHeaderStyle}>Contact</th>
                  <th style={tableHeaderStyle}>Location</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Received</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((seller) => {
                  const colors =
                    statusColors[seller.status] ?? {
                      fill: '#f59e0b',
                      text: '#92400e',
                    };
                  return (
                    <tr
                      key={seller.id}
                      onClick={() => setSelectedId(seller.id)}
                      style={{
                        cursor: 'pointer',
                        background: selectedSeller?.id === seller.id ? '#eff6ff' : '#ffffff',
                      }}
                    >
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          {getProfilePicUrl(seller) ? (
                            <img
                              src={getProfilePicUrl(seller) ?? ''}
                              alt={seller.sellerName}
                              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 13,
                                flexShrink: 0,
                              }}
                            >
                              {buildInitials(seller.sellerName)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{seller.sellerName}</div>
                            <div style={{ color: '#6b7280', marginTop: 4 }}>{seller.businessName}</div>
                            <div style={{ color: '#9ca3af', marginTop: 4, fontSize: 12 }}>
                              @{seller.upstream.username ?? 'unknown'} • {seller.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: 600 }}>{seller.phone || 'Unavailable'}</div>
                        <div style={{ color: '#6b7280', marginTop: 4 }}>{seller.email || 'Unavailable'}</div>
                      </td>
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: 600 }}>
                          {[seller.location.city, seller.location.state].filter(Boolean).join(', ') || 'Location unavailable'}
                        </div>
                        <div style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}>
                          {[seller.location.street, seller.location.pincode].filter(Boolean).join(' • ')}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <Badge
                          label={seller.status}
                          background={colors.fill === '#10b981' ? '#d1fae5' : colors.fill === '#ef4444' ? '#fee2e2' : '#fef3c7'}
                          color={colors.text}
                        />
                        <div style={{ color: '#9ca3af', marginTop: 6, fontSize: 12 }}>
                          Raw: {seller.upstream.rawSellerStatus ?? seller.status}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <div>{formatDateTime(seller.receivedAt)}</div>
                        <div style={{ color: '#9ca3af', marginTop: 4, fontSize: 12 }}>
                          Updated {formatDateTime(seller.updatedAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...tableCellStyle, color: '#6b7280', textAlign: 'center', padding: 28 }}>
                      No sellers matched the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <aside style={{ ...cardStyle, padding: 20, position: 'sticky', top: 24 }}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Seller Details</h2>
              <p style={sectionSubtitleStyle}>Read-only upstream snapshot for super admin review.</p>
            </div>
          </div>

          {selectedSeller ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {getProfilePicUrl(selectedSeller) ? (
                  <img
                    src={getProfilePicUrl(selectedSeller) ?? ''}
                    alt={selectedSeller.sellerName}
                    style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {buildInitials(selectedSeller.sellerName)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>{selectedSeller.sellerName}</div>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>{selectedSeller.businessName}</div>
                </div>
              </div>

              <div style={detailGridStyle}>
                {[
                  ['Username', selectedSeller.upstream.username ?? 'Unknown'],
                  ['Email', selectedSeller.email || 'Unavailable'],
                  ['Phone', selectedSeller.phone || 'Unavailable'],
                  ['GST / Enrollment', selectedSeller.gstOrEnrollmentId || 'Unavailable'],
                  ['Shipping Method', selectedSeller.upstream.shippingMethod ?? 'Unavailable'],
                  ['Documents', `${selectedSeller.documentsCount}`],
                  ['Address', [selectedSeller.location.street, selectedSeller.location.city, selectedSeller.location.state, selectedSeller.location.pincode].filter(Boolean).join(', ') || 'Unavailable'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'grid', gap: 4 }}>
                    <div style={detailLabelStyle}>{label}</div>
                    <div style={detailValueStyle}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>Current status</span>
                  <Badge
                    label={selectedSeller.status}
                    background={
                      selectedSeller.status === 'approved'
                        ? '#d1fae5'
                        : selectedSeller.status === 'rejected'
                          ? '#fee2e2'
                          : '#fef3c7'
                    }
                    color={
                      selectedSeller.status === 'approved'
                        ? '#065f46'
                        : selectedSeller.status === 'rejected'
                          ? '#991b1b'
                          : '#92400e'
                    }
                  />
                </div>
                <div style={{ color: '#6b7280', fontSize: 12 }}>
                  Received {formatDateTime(selectedSeller.receivedAt)}
                </div>
                {selectedSeller.lastStatusAt ? (
                  <div style={{ color: '#6b7280', fontSize: 12 }}>
                    Last status update {formatDateTime(selectedSeller.lastStatusAt)}
                  </div>
                ) : null}
                {selectedSeller.lastStatusNote ? (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      color: '#475569',
                      fontSize: 12,
                    }}
                  >
                    {selectedSeller.lastStatusNote}
                  </div>
                ) : null}
              </div>

              {selectedDetail ? (
                <>
                  <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 12 }}>
                    <div style={detailLabelStyle}>Seller Profile</div>
                    <div style={detailGridStyle}>
                      {[
                        ['Business Name', selectedDetail.sellerProfile.businessName || 'Unavailable'],
                        ['Shipping Method', selectedDetail.sellerProfile.shippingMethod || 'Unavailable'],
                        ['T&C Accepted', selectedDetail.sellerProfile.tcAccepted ? 'Yes' : 'No'],
                        ['Billing Address', selectedDetail.sellerProfile.address.billingAddress || 'Unavailable'],
                        ['Pickup Address', selectedDetail.sellerProfile.address.pickupAddress || 'Unavailable'],
                        ['Pincode', selectedDetail.sellerProfile.address.pinCode || 'Unavailable'],
                        ['State', selectedDetail.sellerProfile.address.state || 'Unavailable'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'grid', gap: 4 }}>
                          <div style={detailLabelStyle}>{label}</div>
                          <div style={detailValueStyle}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 12 }}>
                    <div style={detailLabelStyle}>Bank Details</div>
                    <div style={detailGridStyle}>
                      {[
                        ['Account Holder', selectedDetail.sellerProfile.bankDetails.accountHolderName || 'Unavailable'],
                        ['Account Number', selectedDetail.sellerProfile.bankDetails.accountNumber || 'Unavailable'],
                        ['Bank', selectedDetail.sellerProfile.bankDetails.bankName || 'Unavailable'],
                        ['IFSC', selectedDetail.sellerProfile.bankDetails.ifscCode || 'Unavailable'],
                        ['UPI', selectedDetail.sellerProfile.bankDetails.upiId || 'Unavailable'],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'grid', gap: 4 }}>
                          <div style={detailLabelStyle}>{label}</div>
                          <div style={detailValueStyle}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 12 }}>
                    <div style={detailLabelStyle}>Commerce Snapshot</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                      {[
                        ['Followers', selectedDetail.followerCount],
                        ['Reviews', selectedDetail.reviewsCount],
                        ['Products Sold', selectedDetail.productsSoldCount],
                        ['Rating', selectedDetail.customerRating],
                        ['Saved Products', selectedDetail.savedProducts.length],
                        ['Selling Products', selectedDetail.sellingProducts.length],
                        ['Uploaded Bits', selectedDetail.uploadedBits.length],
                        ['Saved Bits', selectedDetail.savedBits.length],
                      ].map(([label, value]) => (
                        <div key={label} style={{ ...cardStyle, padding: 12, boxShadow: 'none' }}>
                          <div style={detailLabelStyle}>{label}</div>
                          <div style={{ ...detailValueStyle, marginTop: 6, fontSize: 18, fontWeight: 700 }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 12 }}>
                    <div style={detailLabelStyle}>Documents</div>
                    {selectedDetail.sellerProfile.documents.length > 0 ? (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {selectedDetail.sellerProfile.documents.map((document) => (
                          <a
                            key={`${document.publicId}-${document.type}`}
                            href={document.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              textDecoration: 'none',
                              color: '#2563eb',
                              fontSize: 13,
                              border: '1px solid #e5e7eb',
                              borderRadius: 8,
                              padding: 10,
                              background: '#f8fafc',
                            }}
                          >
                            {document.type} • Open document
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#6b7280', fontSize: 13 }}>No seller documents were returned by the upstream API.</div>
                    )}
                  </div>

                  <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 12 }}>
                    <div style={detailLabelStyle}>Products & Activity</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {selectedDetail.sellingProducts.slice(0, 5).map((product) => (
                        <div key={`selling-${product.id}`} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{product.name}</div>
                          <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                            {product.category} • Rs. {product.discountedPrice ?? product.price}
                          </div>
                        </div>
                      ))}
                      {selectedDetail.sellingProducts.length === 0 ? (
                        <div style={{ color: '#6b7280', fontSize: 13 }}>No selling products available.</div>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ paddingTop: 14, borderTop: '1px solid #e5e7eb', display: 'grid', gap: 12 }}>
                    <div style={detailLabelStyle}>Bargains</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {selectedDetail.bargainsWithSeller.slice(0, 5).map((bargain) => (
                        <div key={bargain.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{bargain.productName}</div>
                          <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                            {bargain.statusLabel} • Rs. {bargain.currentPrice} • {bargain.role}
                          </div>
                        </div>
                      ))}
                      {selectedDetail.bargainsWithSeller.length === 0 ? (
                        <div style={{ color: '#6b7280', fontSize: 13 }}>No bargains available.</div>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontSize: 13 }}>Select a seller to inspect their upstream details.</div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default SellerDirectory;
