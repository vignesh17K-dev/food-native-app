import { useCallback } from "react";
import * as Location from "expo-location";
import { useAppToast } from "../context/AppToast";

export type DeliveryAddress = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useGetLocation() {
  const toast = useAppToast();

  const showError = useCallback(
    (error: unknown, fallback: string) => {
      toast.show({
        title: errorMessage(error, fallback),
        background: "red.800",
      });
    },
    [toast],
  );

  const getLocation = useCallback(async (): Promise<DeliveryAddress> => {
    try {
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        if (!permission.canAskAgain) {
          throw new Error(
            "Location access is disabled. Enable it in your device settings, or enter your address manually.",
          );
        }

        throw new Error(
          "Location permission is needed to find your delivery address.",
        );
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      let formattedAddress = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const place = results[0];

        if (place) {
          formattedAddress = [
            place.name,
            place.street,
            place.district,
            place.city,
            place.region,
            place.postalCode,
          ]
            .filter(Boolean)
            .filter((value, index, values) => values.indexOf(value) === index)
            .join(", ");
        }
      } catch (error) {
        console.error(error);
        toast.show({
          title: errorMessage(
            error,
            "Could not look up your street address. Using coordinates instead.",
          ),
          background: "red.800",
        });
      }

      return {
        latitude,
        longitude,
        formattedAddress,
      };
    } catch (error) {
      showError(error, "Unable to get your location. Please try again.");
      throw error;
    }
  }, [showError, toast]);

  return getLocation;
}
