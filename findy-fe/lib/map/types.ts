/** map-service GET /api/v1/stores/{storeId}/map-config */

export type StoreMapConfigApi = {
  store: {
    storeId: number;
    storeName: string;
    address: string;
    status: string;
  };
  map: {
    mapId: number;
    mapImageUrl: string | null;
    widthMeters: number;
    heightMeters: number;
  };
  layout: {
    gridCols: number;
    gridRows: number;
    cellSizeMeters: number;
    gridIdFormula: string;
  };
  grids: Array<{
    gridId: number;
    gridX: number;
    gridY: number;
    cellType: string;
  }>;
  beacons: Array<{
    beaconId: number;
    gridId: number;
    gridX: number;
    gridY: number;
    beaconUuid: string;
    major: number | null;
    minor: number | null;
    mac: string | null;
  }>;
};

export type ApiEnvelope<T> = {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
};

/** map-service POST /api/v1/path */
export type PathLegApi = {
  fromGridId: number;
  toGridId: number;
  pathGridIds: number[];
};

export type PathNavigationApi = {
  storeId: number;
  currentGridId: number;
  destinationGridIds: number[];
  legs: PathLegApi[];
  fullPathGridIds: number[];
};

/** map-service GET /api/v1/stores/{storeId}/grids/congestion */
export type GridCongestionLevelApi = "LOW" | "MEDIUM" | "HIGH";

export type GridCongestionPointApi = {
  gridId: number;
  gridX: number;
  gridY: number;
  activeUserCount: number;
  threshold: number;
  congested: boolean;
  level: GridCongestionLevelApi;
};

export type GridCongestionListApi = {
  storeId: number;
  windowSeconds: number;
  threshold: number;
  points: GridCongestionPointApi[];
};
