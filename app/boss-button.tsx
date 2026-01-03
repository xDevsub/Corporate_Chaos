/**
 * @file app/boss-button.tsx
 * @description Boss Button easter egg - fake spreadsheet overlay
 * @platform React Native (Expo)
 * @spec PLAN/SPECS/spec-001-core-game.md
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackEvent } from '../src/utils/analytics';

// Fake spreadsheet data
const SPREADSHEET_DATA = [
  { region: 'APAC', q1: '$1.2M', q2: '$1.4M', q3: '$1.6M' },
  { region: 'EMEA', q1: '$890K', q2: '$920K', q3: '$1.1M' },
  { region: 'LATAM', q1: '$450K', q2: '$520K', q3: '$680K' },
  { region: 'NA', q1: '$2.1M', q2: '$2.3M', q3: '$2.8M' },
  { region: 'Total', q1: '$4.64M', q2: '$5.14M', q3: '$6.18M' },
];

export default function BossButtonScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    trackEvent('boss_button_pressed', { scenario_id: null });
  }, []);

  const handleDismiss = () => {
    router.back();
  };

  return (
    <Pressable 
      style={[styles.container, { paddingTop: insets.top }]} 
      onPress={handleDismiss}
    >
      {/* Fake toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
          <Text style={styles.fileName}>Q3_Revenue_Projections_FINAL_v2.xlsx</Text>
        </View>
        <View style={styles.toolbarRight}>
          <Text style={styles.toolbarIcon}>💾</Text>
          <Text style={styles.toolbarIcon}>↩️</Text>
          <Text style={styles.toolbarIcon}>↪️</Text>
        </View>
      </View>

      {/* Formula bar */}
      <View style={styles.formulaBar}>
        <View style={styles.cellRef}>
          <Text style={styles.cellRefText}>A1</Text>
        </View>
        <View style={styles.formulaInput}>
          <Text style={styles.formulaText}>=SUM(B2:D5)</Text>
        </View>
      </View>

      {/* Spreadsheet */}
      <ScrollView style={styles.spreadsheet}>
        {/* Header row */}
        <View style={styles.row}>
          <View style={[styles.cell, styles.headerCell, styles.cellA]}>
            <Text style={styles.headerText}>Region</Text>
          </View>
          <View style={[styles.cell, styles.headerCell]}>
            <Text style={styles.headerText}>Q1</Text>
          </View>
          <View style={[styles.cell, styles.headerCell]}>
            <Text style={styles.headerText}>Q2</Text>
          </View>
          <View style={[styles.cell, styles.headerCell]}>
            <Text style={styles.headerText}>Q3 (est)</Text>
          </View>
        </View>

        {/* Data rows */}
        {SPREADSHEET_DATA.map((row, index) => (
          <View 
            key={row.region} 
            style={[
              styles.row, 
              index === SPREADSHEET_DATA.length - 1 && styles.totalRow
            ]}
          >
            <View style={[styles.cell, styles.cellA]}>
              <Text style={[
                styles.cellText,
                index === SPREADSHEET_DATA.length - 1 && styles.boldText
              ]}>
                {row.region}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={[
                styles.cellText,
                styles.numberText,
                index === SPREADSHEET_DATA.length - 1 && styles.boldText
              ]}>
                {row.q1}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={[
                styles.cellText,
                styles.numberText,
                index === SPREADSHEET_DATA.length - 1 && styles.boldText
              ]}>
                {row.q2}
              </Text>
            </View>
            <View style={[styles.cell, index === SPREADSHEET_DATA.length - 1 && styles.highlightCell]}>
              <Text style={[
                styles.cellText,
                styles.numberText,
                index === SPREADSHEET_DATA.length - 1 && styles.boldText
              ]}>
                {row.q3}
              </Text>
            </View>
          </View>
        ))}

        {/* Empty rows for authenticity */}
        {[...Array(10)].map((_, i) => (
          <View key={`empty-${i}`} style={styles.row}>
            <View style={[styles.cell, styles.cellA]} />
            <View style={styles.cell} />
            <View style={styles.cell} />
            <View style={styles.cell} />
          </View>
        ))}
      </ScrollView>

      {/* Sheet tabs */}
      <View style={styles.sheetTabs}>
        <View style={[styles.sheetTab, styles.activeTab]}>
          <Text style={styles.sheetTabText}>Sheet1</Text>
        </View>
        <View style={styles.sheetTab}>
          <Text style={[styles.sheetTabText, styles.inactiveTabText]}>Sheet2</Text>
        </View>
        <View style={styles.sheetTab}>
          <Text style={[styles.sheetTabText, styles.inactiveTabText]}>Pivot</Text>
        </View>
      </View>

      {/* Tap to dismiss hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>Tap anywhere to return to game</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#217346',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    gap: 3,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: '#fff',
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarRight: {
    flexDirection: 'row',
    gap: 16,
  },
  toolbarIcon: {
    fontSize: 16,
  },
  formulaBar: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cellRef: {
    width: 60,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    alignItems: 'center',
  },
  cellRefText: {
    fontSize: 12,
    color: '#333',
  },
  formulaInput: {
    flex: 1,
    padding: 8,
  },
  formulaText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  spreadsheet: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  totalRow: {
    backgroundColor: '#f5f5f5',
  },
  cell: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    justifyContent: 'center',
  },
  cellA: {
    flex: 0.8,
    backgroundColor: '#fafafa',
  },
  headerCell: {
    backgroundColor: '#f0f0f0',
  },
  highlightCell: {
    backgroundColor: '#e8f5e9',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  cellText: {
    fontSize: 12,
    color: '#333',
  },
  numberText: {
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  boldText: {
    fontWeight: '600',
  },
  sheetTabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  sheetTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#217346',
  },
  sheetTabText: {
    fontSize: 12,
    color: '#333',
  },
  inactiveTabText: {
    color: '#888',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 12,
  },
});

