import { StyleSheet, View } from 'react-native';

/** Placeholder silhouette on the signals greeting. It is not a user photo. */
type AvatarProps = {
  size: number;
  tone?: 'light' | 'warm';
};

export function Avatar({ size, tone = 'warm' }: AvatarProps) {
  const head = size * 0.34;
  const body = size * 0.62;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tone === 'light' ? '#F4F4F5' : '#6B625C',
        },
      ]}
    >
      <View
        style={{
          width: head,
          height: head,
          borderRadius: head / 2,
          backgroundColor: tone === 'light' ? '#D4D4D8' : '#E7E5E4',
          marginTop: size * 0.16,
        }}
      />
      <View
        style={{
          width: body,
          height: body * 0.72,
          borderTopLeftRadius: body,
          borderTopRightRadius: body,
          backgroundColor: tone === 'light' ? '#D4D4D8' : '#D6D3D1',
          marginTop: size * 0.08,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    overflow: 'hidden',
  },
});
