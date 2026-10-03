import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import ArrowLeft from '@/assets/svg/icons/arrow-left.svg';
import ArrowRight from '@/assets/svg/icons/arrow-right.svg';
import Bell from '@/assets/svg/icons/bell.svg';
import Calendar from '@/assets/svg/icons/calendar.svg';
import Camera from '@/assets/svg/icons/camera.svg';
import Check from '@/assets/svg/icons/check.svg';
import CheckCircle from '@/assets/svg/icons/check-circle.svg';
import ChevronDown from '@/assets/svg/icons/chevron-down.svg';
import ChevronLeft from '@/assets/svg/icons/chevron-left.svg';
import ChevronRight from '@/assets/svg/icons/chevron-right.svg';
import Circle from '@/assets/svg/icons/circle.svg';
import Clock from '@/assets/svg/icons/clock.svg';
import Close from '@/assets/svg/icons/close.svg';
import Dot from '@/assets/svg/icons/dot.svg';
import Edit from '@/assets/svg/icons/edit.svg';
import History from '@/assets/svg/icons/history.svg';
import Home from '@/assets/svg/icons/home.svg';
import HomeFilled from '@/assets/svg/icons/home-filled.svg';
import Leaf from '@/assets/svg/icons/leaf.svg';
import Mail from '@/assets/svg/icons/mail.svg';
import Minus from '@/assets/svg/icons/minus.svg';
import Moon from '@/assets/svg/icons/moon.svg';
import More from '@/assets/svg/icons/more.svg';
import Package from '@/assets/svg/icons/package.svg';
import Pill from '@/assets/svg/icons/pill.svg';
import Plus from '@/assets/svg/icons/plus.svg';
import Profiles from '@/assets/svg/icons/profiles.svg';
import Search from '@/assets/svg/icons/search.svg';
import Settings from '@/assets/svg/icons/settings.svg';
import { useThemeColor } from '@/hooks/use-theme-color';

const ICONS = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  bell: Bell,
  calendar: Calendar,
  camera: Camera,
  check: Check,
  'check-circle': CheckCircle,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  circle: Circle,
  clock: Clock,
  close: Close,
  dot: Dot,
  edit: Edit,
  history: History,
  home: Home,
  'home-filled': HomeFilled,
  leaf: Leaf,
  mail: Mail,
  minus: Minus,
  moon: Moon,
  more: More,
  package: Package,
  pill: Pill,
  plus: Plus,
  profiles: Profiles,
  search: Search,
  settings: Settings,
} satisfies Record<string, FC<SvgProps>>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  /** Defaults to the theme's icon color. The SVGs draw with `currentColor`. */
  color?: string;
}

/** Decorative by default: pair it with visible text, never use it as the only label. */
export function Icon({ name, size = 20, color }: IconProps) {
  const themeColor = useThemeColor({}, 'icon');
  const Svg = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      color={color ?? themeColor}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
