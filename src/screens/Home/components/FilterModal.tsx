import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { COLORS, SIZES } from "../../../../constants";
import ImageLinks from "../../../../assets/ImageLink";
import constants from "../../../../utils/constants";
import Button from "../../../components/Button";
import { useAppTheme } from "../../../hooks/useAppTheme";
import product from "../../../../utils/api/product";
import { Restaurant } from "../../../../types/restaurant";

const THUMB_SIZE = 30;
const PRIMARY = "#ed7550";

export type FilterValues = {
  distanceMin: number;
  distanceMax: number;
  deliveryTime: number | null;
  priceMin: number;
  priceMax: number;
  rating: number | null;
  tags: number[];
  restaurantId: string | null;
};

export const DEFAULT_FILTER_VALUES: FilterValues = {
  distanceMin: 0,
  distanceMax: 20,
  deliveryTime: null,
  priceMin: 0,
  priceMax: 100,
  rating: null,
  tags: [],
  restaurantId: null,
};

type RangeSliderProps = {
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  formatLabel: (value: number) => string;
};

const RangeSlider = ({
  min,
  max,
  low,
  high,
  onChange,
  formatLabel,
}: RangeSliderProps) => {
  const { colors, darkMode } = useAppTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const startPos = useRef(0);
  const lowRef = useRef(low);
  const highRef = useRef(high);
  const onChangeRef = useRef(onChange);
  const minRef = useRef(min);
  const maxRef = useRef(max);

  lowRef.current = low;
  highRef.current = high;
  onChangeRef.current = onChange;
  minRef.current = min;
  maxRef.current = max;

  const clampValue = (value: number) =>
    Math.min(maxRef.current, Math.max(minRef.current, Math.round(value)));

  const valueToPosition = (value: number, width: number) => {
    if (width <= THUMB_SIZE) return 0;
    return (
      ((value - minRef.current) / (maxRef.current - minRef.current)) *
      (width - THUMB_SIZE)
    );
  };

  const positionToValue = (position: number, width: number) => {
    if (width <= THUMB_SIZE) return minRef.current;
    const ratio = position / (width - THUMB_SIZE);
    return clampValue(
      minRef.current + ratio * (maxRef.current - minRef.current)
    );
  };

  const createPanResponder = (isLow: boolean) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const width = trackWidthRef.current;
        startPos.current = valueToPosition(
          isLow ? lowRef.current : highRef.current,
          width
        );
      },
      onPanResponderMove: (_, gesture) => {
        const width = trackWidthRef.current;
        if (width <= THUMB_SIZE) return;

        const nextPos = Math.min(
          width - THUMB_SIZE,
          Math.max(0, startPos.current + gesture.dx)
        );
        const nextValue = positionToValue(nextPos, width);

        if (isLow) {
          onChangeRef.current(
            Math.min(nextValue, highRef.current),
            highRef.current
          );
        } else {
          onChangeRef.current(
            lowRef.current,
            Math.max(nextValue, lowRef.current)
          );
        }
      },
    });

  const lowPan = useRef(createPanResponder(true)).current;
  const highPan = useRef(createPanResponder(false)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    trackWidthRef.current = width;
    setTrackWidth(width);
  };

  const lowPosition = valueToPosition(low, trackWidth);
  const highPosition = valueToPosition(high, trackWidth);

  return (
    <View style={styles.rangeSlider}>
      <View style={styles.trackContainer} onLayout={handleLayout}>
        <View
          style={[
            styles.track,
            {
              backgroundColor: darkMode
                ? colors.searchBackground
                : colors.inputMuted,
            },
          ]}
        />
        <View
          style={[
            styles.trackFilled,
            {
              left: lowPosition + THUMB_SIZE / 2,
              width: Math.max(0, highPosition - lowPosition),
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            { left: lowPosition, borderColor: colors.surfaceElevated },
          ]}
          {...lowPan.panHandlers}
        />
        <View
          style={[
            styles.thumb,
            { left: highPosition, borderColor: colors.surfaceElevated },
          ]}
          {...highPan.panHandlers}
        />
      </View>
      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabel, { color: colors.text }]}>
          {formatLabel(low)}
        </Text>
        <Text style={[styles.rangeLabel, { color: colors.text }]}>
          {formatLabel(high)}
        </Text>
      </View>
    </View>
  );
};

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  initialFilters?: FilterValues | null;
};

const FilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) => {
  const { colors, darkMode } = useAppTheme();
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTER_VALUES);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const sheet_background = darkMode ? colors.surface : colors.surfaceElevated;

  const chip_style = (selected: boolean) =>
    selected
      ? styles.chipSelected
      : {
          backgroundColor: darkMode
            ? colors.surfaceElevated
            : colors.inputMuted,
        };

  const chip_text_style = (selected: boolean) =>
    selected
      ? styles.chipTextSelected
      : { color: darkMode ? colors.fieldText : colors.textSecondary };

  useEffect(() => {
    if (visible) {
      setFilters(
        initialFilters
          ? { ...DEFAULT_FILTER_VALUES, ...initialFilters }
          : DEFAULT_FILTER_VALUES
      );
    }
  }, [visible, initialFilters]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let cancelled = false;
    const loadRestaurants = async () => {
      try {
        const response = await product.get_restaurants();
        if (!cancelled) {
          setRestaurants(response?.data ?? []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadRestaurants();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const toggleTag = (tagId: number) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: sheet_background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Filter Your Search
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Image
                source={ImageLinks.cross}
                style={[styles.closeIcon, { tintColor: colors.icon }]}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Distance
            </Text>
            <RangeSlider
              min={0}
              max={20}
              low={filters.distanceMin}
              high={filters.distanceMax}
              onChange={(distanceMin, distanceMax) =>
                setFilters((prev) => ({ ...prev, distanceMin, distanceMax }))
              }
              formatLabel={(value) => `${value} km`}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Delivery Time
            </Text>
            <View style={styles.chipRow}>
              {constants.delivery_time.map((item) => {
                const selected = filters.deliveryTime === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, chip_style(selected)]}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        deliveryTime: selected ? null : item.id,
                      }))
                    }
                  >
                    <Text style={[styles.chipText, chip_text_style(selected)]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pricing Range
            </Text>
            <RangeSlider
              min={0}
              max={100}
              low={filters.priceMin}
              high={filters.priceMax}
              onChange={(priceMin, priceMax) =>
                setFilters((prev) => ({ ...prev, priceMin, priceMax }))
              }
              formatLabel={(value) => `$${value}`}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ratings
            </Text>
            <View style={styles.chipRow}>
              {constants.ratings.map((item) => {
                const selected = filters.rating === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, chip_style(selected)]}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: selected ? null : item.id,
                      }))
                    }
                  >
                    <Text style={[styles.chipText, chip_text_style(selected)]}>
                      {item.label} ★
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tags
            </Text>
            <View style={styles.chipRow}>
              {constants.tags.map((item) => {
                const selected = filters.tags.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, chip_style(selected)]}
                    onPress={() => toggleTag(item.id)}
                  >
                    <Text style={[styles.chipText, chip_text_style(selected)]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {restaurants.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Restaurant
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.restaurantRow}
                >
                  {restaurants.map((item) => {
                    const selected = filters.restaurantId === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.restaurantChip,
                          chip_style(selected),
                          selected && styles.restaurantChipSelected,
                        ]}
                        onPress={() =>
                          setFilters((prev) => ({
                            ...prev,
                            restaurantId: selected ? null : item.id,
                          }))
                        }
                      >
                        <Image
                          source={{ uri: item.logo }}
                          style={styles.restaurantLogo}
                        />
                        <Text
                          style={[
                            styles.chipText,
                            chip_text_style(selected),
                            styles.restaurantName,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              text="Apply Filters"
              type="primary"
              width="100%"
              onClick={handleApply}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingTop: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.lightGray1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: 14,
    height: 14,
  },
  content: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  rangeSlider: {
    marginBottom: 8,
  },
  trackContainer: {
    height: THUMB_SIZE,
    justifyContent: "center",
  },
  track: {
    height: 10,
    borderRadius: 2,
  },
  trackFilled: {
    position: "absolute",
    height: 10,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: PRIMARY,
    borderWidth: 4,
    top: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: PRIMARY,
  },
  chipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  restaurantRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 8,
  },
  restaurantChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    maxWidth: 180,
    gap: 8,
  },
  restaurantChipSelected: {
    backgroundColor: PRIMARY,
  },
  restaurantLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  restaurantName: {
    flexShrink: 1,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});
