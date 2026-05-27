import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type SettingsPreferencesContextValue = {
  notificationEnabled: boolean;
  locationEnabled: boolean;
  setNotificationEnabled: (value: boolean) => void;
  setLocationEnabled: (value: boolean) => void;
};

const SettingsPreferencesContext =
  createContext<SettingsPreferencesContextValue | null>(null);

export function SettingsPreferencesProvider({ children }: PropsWithChildren) {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <SettingsPreferencesContext.Provider
      value={{
        notificationEnabled,
        locationEnabled,
        setNotificationEnabled,
        setLocationEnabled,
      }}
    >
      {children}
    </SettingsPreferencesContext.Provider>
  );
}

export function useSettingsPreferences() {
  const context = useContext(SettingsPreferencesContext);
  if (!context) {
    throw new Error(
      "useSettingsPreferences must be used within SettingsPreferencesProvider",
    );
  }
  return context;
}
