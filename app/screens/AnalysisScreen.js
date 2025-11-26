import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts'; 
import { Ionicons, Feather } from '@expo/vector-icons'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

// Цвета
const GREEN = '#25CD25';
const VIOLET = '#8234F7'; 
const DARK_BG = '#1E1E1E'; 
const CARD_BG = '#2A2A2D'; 

// --- Компонент для рендера меток X-оси (белый цвет) ---
const renderXLabel = (label) => (
  // Стиль xAxisLabelWhiteCustom использует color: '#fff', что обеспечивает белый цвет.
  <Text style={styles.xAxisLabelWhiteCustom}>{label}</Text>
);

// --- Компонент для отображения значения при наведении (Tooltip) ---
const CustomPointerLabel = (items) => {
  if (!items.length) return null;
  const value = items[0].value;
  const displayValue = value.toLocaleString('ru-RU', { maximumFractionDigits: 0 }); 
  return (
    <View style={styles.tooltipContainerCustom}>
      <Text style={styles.tooltipText}>{displayValue}</Text>
    </View>
  );
};

// --- Основной компонент экрана ---
export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 15);   // минимум 15
  const bottomPadding = insets.bottom + 20;
  // Данные для графика
  const lineData = [
    { value: 2000, label: 'Sep1' },
    { value: 1500 },
    { value: 1300, label: 'Sep5' },
    { value: 2100 },
    { value: 1000, label: 'Sep10' },
    { value: 1650 },
    { value: 1365, label: 'Sep15' }, 
    { value: 1100 },
    { value: 1500, label: 'Sep20' },
    { value: 1300 },
    { value: 1700, label: 'Sep25' },
    { value: 1300 },
    { value: 2000, label: 'Sep30' },
  ];
  
  const pointSpacing = 70;
  const chartWidth = lineData.length * pointSpacing + 10; 
  const initialEndSpacing = 35; 
  const MAX_VALUE = 2500;
  const Y_LABELS = ['2500', '2000', '1500', '1000', '500', '0'];


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: topPadding, 
          paddingBottom: bottomPadding, 
          paddingHorizontal: 15 
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Анализ</Text>

        {/* --- Карточка графика --- */}
        <View style={styles.chartCard}>
          <View style={styles.dateDropdownContainer}>
            <View style={styles.dateDropdown}>
              <Feather name="calendar" size={14} color="black" />
              <Text style={styles.dateText}>01–07 June</Text>
              <Feather name="chevron-down" size={14} color="black" />
            </View>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.yAxisContainer}>
              {Y_LABELS.map((v, i) => (
                <Text key={i} style={styles.yAxisLabel}>{v}</Text>
              ))}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chartScrollView}
              contentContainerStyle={{ paddingRight: 16 }} 
            >
              <View style={{ width: chartWidth, height: 250 }}>
                <LineChart
                  curved
                  data={lineData}
                  color={VIOLET}
                  thickness={3}
                  spacing={pointSpacing}
                  initialSpacing={initialEndSpacing}
                  endSpacing={initialEndSpacing}
                  areaChart={false}
                  hideDataPoints={false} 
                  dataPointsColor={VIOLET}
                  dataPointsRadius={4}
                  maxValue={MAX_VALUE}
                  noOfSections={5}
                  rulesColor="rgba(255,255,255,0.2)"
                  rulesType="solid"
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor="rgba(255,255,255,0.2)"
                  hideYAxisText={true} 
                  renderXAxisLabel={renderXLabel}
                  pointerConfig={{
                    activatePointersOnMove: true,
                    activatePointersOnPress: true,
                    pointerStripColor: 'rgba(255,255,255,0.4)',
                    pointerStripWidth: 1,
                    pointerStripUptoDataPoint: true,
                    pointerColor: VIOLET,
                    radius: 6,
                    pointerLabelComponent: CustomPointerLabel,
                    pointerLabelWidth: 50,
                    pointerLabelHeight: 25,
                    pointerStripHeight: 180, 
                    pointerComponent: () => (
                      <View style={styles.pointerCircle} />
                    ),
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Заголовок Отчеты */}
        <Text style={styles.sectionTitle}>Отчеты</Text>
        
        <View style={styles.reportsGrid}>
          <ReportSummaryCard 
            title="Недельный отчет" 
            iconColor={GREEN}
            cardColor={CARD_BG}
          />
          <View style={{ width: 12 }} />
          <ReportSummaryCard 
            title="Месячный отчет" 
            iconColor={VIOLET}
            cardColor={CARD_BG}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <DownloadItem title="Месячный отчет" date="22.11.2025" iconColor={VIOLET} />
          <DownloadItem title="Недельный отчет" date="22.11.2025" iconColor={GREEN} />
          <DownloadItem title="Недельный отчет" date="22.11.2025" iconColor={GREEN} />
        </View>
      </ScrollView>
    </View>
  );
}

// --- Вспомогательные компоненты ---

const ReportSummaryCard = ({ title, iconColor, cardColor }) => (
  <View style={[styles.summaryCard, { backgroundColor: cardColor }]}>
    <Ionicons name="document-text-outline" size={26} color={iconColor} />
    <View style={styles.summaryCardBottom}>
      <Text style={styles.summaryCardTitle}>{title.replace(' ', '\n')}</Text>
      <Feather name="download" size={20} color="gray" />
    </View>
  </View>
);

const DownloadItem = ({ title, date, iconColor }) => (
  <View style={styles.downloadItem}>
    <Ionicons name="document-text-outline" size={26} color={iconColor} />
    <View style={styles.downloadItemTextContainer}>
      <Text style={styles.downloadItemTitle}>{title}</Text>
      <Text style={styles.downloadItemDate}>{date}</Text>
    </View>
    <TouchableOpacity style={styles.downloadButton}>
      <Text style={styles.downloadButtonText}>Скачать</Text>
    </TouchableOpacity>
  </View>
);

// --- Стили ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 20, 
    marginTop: 25,
    height: 330,
  },
  dateDropdownContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  dateDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    marginHorizontal: 8,
    color: '#000',
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 230,
    paddingLeft: 0, 
    paddingRight: 0, 
  },
  yAxisContainer: {
    width: 45,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 1, // совпадает с верхним и нижним отступом графика
    paddingRight: 5,
    marginLeft: 0, // почти к краю
},
 chartScrollView: {
    flex: 1,
    marginLeft: 0,
},
  yAxisLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Стиль для меток X-оси (даты).
xAxisLabelWhiteCustom: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    width: 70,
    textAlign: 'center',
    marginTop: 2, // чуть выше линии X
    marginBottom: 0,
},
  pointerCircle: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: DARK_BG,
    borderWidth: 2,
    borderColor: VIOLET,
  },
  tooltipContainerCustom: {
    backgroundColor: VIOLET, 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 20,
  },
  reportsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 0, 
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    height: 100,
    justifyContent: 'space-between',
  },
  summaryCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryCardTitle: {
    color: 'white',
    fontSize: 16,
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  downloadItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  downloadItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  downloadItemDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  downloadButton: {
    backgroundColor: VIOLET,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});