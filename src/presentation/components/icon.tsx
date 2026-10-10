import { SymbolView } from 'expo-symbols';
import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import type { ColorValue } from 'react-native';

/** One icon name maps to an SF Symbol on iOS and a Material symbol on Android and web. */
export type IconName =
  | 'settings'
  | 'bell'
  | 'back'
  | 'chevron'
  | 'copy'
  | 'check'
  | 'verified'
  | 'filter'
  | 'list'
  | 'checkCircle'
  | 'profile'
  | 'security'
  | 'history'
  | 'alert'
  | 'theme'
  | 'notifications';

const symbols: Record<
  IconName,
  { ios: SFSymbol; android: AndroidSymbol; web: AndroidSymbol }
> = {
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  back: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  copy: { ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  verified: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
  filter: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
  list: { ios: 'list.bullet', android: 'format_list_bulleted', web: 'format_list_bulleted' },
  checkCircle: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  profile: { ios: 'person', android: 'person', web: 'person' },
  security: { ios: 'shield', android: 'shield', web: 'shield' },
  history: { ios: 'doc.text', android: 'description', web: 'description' },
  alert: { ios: 'megaphone', android: 'campaign', web: 'campaign' },
  theme: { ios: 'photo', android: 'image', web: 'image' },
  notifications: { ios: 'bell', android: 'notifications', web: 'notifications' },
};

type IconProps = {
  name: IconName;
  size?: number;
  color: ColorValue;
};

export function Icon({ name, size = 22, color }: IconProps) {
  return <SymbolView name={symbols[name]} size={size} tintColor={color} />;
}
