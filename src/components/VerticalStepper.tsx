import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAppTheme } from "../hooks/useAppTheme";
import { ACCENT } from "../../utils/theme/appTheme";
import { map } from "lodash";

export type StepperStep = {
  id: string;
  title: string;
  subtitle?: string;
};

type VerticalStepperProps = {
  steps: StepperStep[];
  currentStep: number;
};

const ActiveDot = ({ railColor }: { railColor: string }) => {
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse, opacity]);

  const animated_style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        styles.dot_active,
        {
          backgroundColor: ACCENT,
          borderColor: railColor,
        },
        animated_style,
      ]}
    >
      <View style={styles.dot_inner} />
    </Animated.View>
  );
};

const VerticalStepper = ({ steps, currentStep }: VerticalStepperProps) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {map(steps, (step, index) => {
        const is_delivered_step =
          step.id === "delivered" && index === currentStep;
        const done = index < currentStep || is_delivered_step;
        const active = index === currentStep && !is_delivered_step;
        const upcoming = index > currentStep;
        const railColor = done || active ? ACCENT : "#CCCCCC";
        const isLast = index === steps.length - 1;

        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.rail}>
              {active ? (
                <ActiveDot railColor={railColor} />
              ) : (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: done ? ACCENT : colors.surface,
                      borderColor: railColor,
                    },
                  ]}
                >
                  {done ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={24}
                      color="#fff"
                    />
                  ) : null}
                </View>
              )}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: done ? ACCENT : "#CCCCCC" },
                  ]}
                />
              )}
            </View>

            <View style={[styles.label, !isLast && styles.label_spacing]}>
              <Text
                style={[
                  styles.title,
                  {
                    color: upcoming ? colors.textSecondary : colors.text,
                    fontWeight: active ? "700" : "600",
                  },
                ]}
              >
                {step.title}
              </Text>
              {!!step.subtitle && (
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  {step.subtitle}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default VerticalStepper;

const DOT_SIZE = 50;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rail: {
    width: DOT_SIZE,
    alignItems: "center",
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot_active: {
    borderWidth: 2,
  },
  dot_inner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 50,
  },
  label: {
    flex: 1,
    paddingLeft: 14,
    paddingTop: 2,
  },
  label_spacing: {
    paddingBottom: 22,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 3,
    lineHeight: 18,
  },
});
