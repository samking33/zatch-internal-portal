import { redirect } from 'next/navigation';

const LegacyAdminUsersPage = () => {
  redirect('/admins');
};

export default LegacyAdminUsersPage;
