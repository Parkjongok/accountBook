import PasswordChangeForm from '@/components/PasswordChangeForm';

export default function UserSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">설정</h1>
      <PasswordChangeForm />
    </div>
  );
}
