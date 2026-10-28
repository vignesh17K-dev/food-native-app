import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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

const VerticalStepper = ({ steps, currentStep }: VerticalStepperProps) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {map(steps, (step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        const upcoming = index > currentStep;
        const railColor = done || active ? ACCENT : '#CCCCCC';
        const isLast = index === steps.length - 1;

        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done || active ? ACCENT : colors.surface,
                    borderColor: railColor,
                  },
                  active && styles.dot_active,
                ]}
              >
                {done ? (
                  <MaterialCommunityIcons name="check" size={24} color="#fff" />
                ) : active ? (
                  <View style={styles.dot_inner} />
                ) : null}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: done ? ACCENT : '#CCCCCC' },
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
