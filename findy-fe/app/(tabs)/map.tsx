import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

// 화면 너비의 65% 정도로 줄여서 전체가 한눈에 보이게 조절 
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_CONTAINER_WIDTH = SCREEN_WIDTH * 0.6; 
const MAP_ROWS = 21; 
const MAP_COLS = 31; 

const SHELF_DATA = [
  { r: 3, c: 3, id: "34", name: "과자" },
  { r: 3, c: 4, id: "35", name: "" },
  { r: 3, c: 6, id: "36", name: "과자" },
  { r: 3, c: 7, id: "37", name: "초콜릿" },
  { r: 8, c: 3, id: "13", name: "잡화" },
  { r: 8, c: 4, id: "14", name: "" },
  { r: 13, c: 3, id: "1", name: "의류" },
  { r: 13, c: 4, id: "2", name: "" },
  // 데이터 계속 추가 가능
];

const generateMap = () => {
  const grid = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(1));
  for (let c = 0; c < MAP_COLS; c++) { grid[0][c] = 0; grid[MAP_ROWS-1][c] = 0; }
  for (let r = 0; r < MAP_ROWS; r++) { grid[r][0] = 0; grid[r][MAP_COLS-1] = 0; }
  const shelfStartCols = [3, 6, 9, 12, 15, 18, 21];
  const shelfRows = [[3, 6], [8, 11], [13, 16]];
  shelfRows.forEach(([startR, endR]) => {
    shelfStartCols.forEach(col => {
      for (let r = startR; r <= endR; r++) { grid[r][col] = 0; grid[r][col+1] = 0; }
    });
  });
  const rightShelfCols = [25, 26, 27, 28];
  [4, 5, 9, 10, 14, 15].forEach(r => { rightShelfCols.forEach(c => { grid[r][c] = 0; }); });
  return grid;
};

const mapData = generateMap();

const MapScreen = () => {
  const cellSize = MAP_CONTAINER_WIDTH / MAP_COLS; 
  const [currentIdx, setCurrentIdx] = useState(0);
  const fullPath = [[18, 2], [18, 15], [10, 15], [10, 26], [5, 26]];

  useEffect(() => {
    if (currentIdx < fullPath.length - 1) {
      const timer = setTimeout(() => setCurrentIdx(currentIdx + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [currentIdx]);

  const getPathPoints = () => {
    return fullPath.slice(currentIdx).map(p => 
      `${p[1] * cellSize + cellSize/2},${p[0] * cellSize + cellSize/2}`
    ).join(' ');
  };

  const currentPos = fullPath[currentIdx];

  return (
    <View style={styles.container}>
      {/* 줌/확대 없이 전체가 보이도록 ScrollView 설정을 맞춤 */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={{ width: MAP_CONTAINER_WIDTH, height: MAP_ROWS * cellSize, backgroundColor: '#E5E7EB' }}>
          {mapData.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((cell, c) => {
                const info = SHELF_DATA.find(d => d.r === r && d.c === c);
                return (
                  <View key={`${r}-${c}`} style={[
                    { width: cellSize, height: cellSize }, 
                    cell === 0 ? styles.wall : { backgroundColor: 'transparent' }
                  ]}>
                    {info && (
                      <View style={styles.textContainer}>
                        <Text style={styles.shelfName}>{info.name}</Text>
                        <Text style={styles.shelfId}>{info.id}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <Svg style={StyleSheet.absoluteFill}>
            <Polyline points={getPathPoints()} fill="none" stroke="#FF4D4D" strokeWidth="1.5" strokeLinecap="round" />
          </Svg>

          <View style={[styles.currentDot, { 
            left: currentPos[1] * cellSize + cellSize/4, top: currentPos[0] * cellSize + cellSize/4,
            width: cellSize/2, height: cellSize/2, borderRadius: cellSize/4
          }]} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'center',     // 가로 중앙 정렬
    paddingVertical: 20 
  },
  row: { flexDirection: 'row' },
  wall: { 
    backgroundColor: '#BCBCBC', 
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelfName: {
    fontSize: 7, // 폰트 크기 조절
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  shelfId: {
    fontSize: 3.5,
    color: '#555',
  },
  currentDot: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    borderWidth: 0.8,
    borderColor: 'white',
    zIndex: 10,
  },
});

export default MapScreen;