import { StoreMapView } from "@/components/store-map";
import { SafeView } from "@/components/layout";

export default function MapScreen() {
  return (
    <SafeView edges={["top", "left", "right"]} className="flex-1 bg-white">
      <StoreMapView />
    </SafeView>
  );
}
