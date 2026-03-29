import { redirect } from 'next/navigation';

const LegacyAuditPage = () => {
  redirect('/dashboard');
};

export default LegacyAuditPage;
