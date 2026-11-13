import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export type ActivityRing = {
  label: string;
  value: number;
  color: string;
  current: number;
  target: number;
  unit: string;
};

type Props = {
  title?: string;
  activities: ActivityRing[];
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Ring({ activity, index, size, canvasSize }: { activity: ActivityRing; index: number; size: number; canvasSize: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const gradientId = `activity-gradient-${index}`;
  const value = Math.min(Math.max(activity.value, 0), 100);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value,
      duration: 1100,
      delay: index * 160,
      useNativeDriver: false,
    }).start();
  }, [index, progress, value]);

  return (
    <View
      style={[
        styles.ringLayer,
        {
          width: size,
          height: size,
          left: (canvasSize - size) / 2,
          top: (canvasSize - size) / 2,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.rotated}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={activity.color} stopOpacity="1" />
            <Stop offset="100%" stopColor={activity.color} stopOpacity="0.55" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#31594f"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#dcebe3"
          strokeWidth={strokeWidth + 3}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          opacity={0.12}
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, 0],
          })}
          strokeLinecap="round"
          opacity={0.98}
        />
      </Svg>
    </View>
  );
}

export function ActivityRings({ title = 'Activity rings', activities }: Props) {
  const ringSize = 210;
  const averageProgress = activities.length
    ? Math.round(activities.reduce((total, activity) => total + Math.min(Math.max(activity.value, 0), 100), 0) / activities.length)
    : 0;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>
        <View style={styles.rings} accessibilityLabel={`Activity rings ${averageProgress}% complete`}>
          {activities.map((activity, index) => (
            <Ring key={activity.label} activity={activity} index={index} size={ringSize - index * 42} canvasSize={ringSize} />
          ))}
          <View pointerEvents="none" style={styles.ringCenter}>
            <Text style={styles.centerValue}>{averageProgress}%</Text>
            <Text style={styles.centerLabel}>TODAY</Text>
          </View>
        </View>
        <View style={styles.details}>
          {activities.map((activity) => (
            <View key={activity.label} style={styles.detail}>
              <Text style={styles.label}>{activity.label}</Text>
              <Text style={[styles.value, { color: activity.color }]}>
                {activity.current}/{activity.target}
                <Text style={styles.unit}> {activity.unit}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#183c35',
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
  },
  title: { color: '#f5f7f3', fontSize: 18, fontWeight: '800', marginBottom: 18 },
  body: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rings: { width: 210, height: 210, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringLayer: { position: 'absolute' },
  rotated: { transform: [{ rotate: '-90deg' }] },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  centerValue: { color: '#f5f7f3', fontSize: 24, fontWeight: '800' },
  centerLabel: { color: '#a8beb3', fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginTop: 2 },
  details: { flex: 1, marginLeft: 22, gap: 14 },
  detail: { borderLeftWidth: 2, borderLeftColor: '#49675d', paddingLeft: 12 },
  label: { color: '#a8beb3', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  value: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  unit: { color: '#a8beb3', fontSize: 11, fontWeight: '700' },
});
