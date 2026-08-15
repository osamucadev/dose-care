import { SegmentedControl } from '@/components/ui/segmented-control';

export type ProfileSection = 'overview' | 'history';

interface ProfileNavTabsProps {
  active: ProfileSection;
  onSelectOverview: () => void;
  onSelectHistory: () => void;
}

/**
 * The Visão geral / Histórico switcher shown near the top of both the
 * profile overview and history screens, right below the avatar/name/
 * type header — reused as-is by both so they always agree on look and
 * behavior. Not a global tab bar: it only exists within these two
 * profile-scoped screens.
 */
export function ProfileNavTabs({ active, onSelectOverview, onSelectHistory }: ProfileNavTabsProps) {
  return (
    <SegmentedControl
      accessibilityLabel="Seções do perfil"
      value={active}
      onChange={(value) => (value === 'overview' ? onSelectOverview() : onSelectHistory())}
      options={[
        { value: 'overview', label: 'Visão geral' },
        { value: 'history', label: 'Histórico' },
      ]}
    />
  );
}
