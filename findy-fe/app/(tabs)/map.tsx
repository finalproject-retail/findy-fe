import { MapScreen } from "@/components/map";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";

export default function MapTabScreen() {
  return (
    <SafeView edges={TAB_SCREEN_EDGES} className="flex-1">
      <MapScreen />
    </SafeView>
  );
}
