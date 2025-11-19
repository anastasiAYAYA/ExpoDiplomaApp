import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

// -----------------------------------------------------------
// 1. Компонент Кругового Индикатора (CircularGauge)
// -----------------------------------------------------------
const CircularGauge = ({ percentage, color1, color2, radius = 50, strokeWidth = 10 }) => {
  const circumference = 2 * Math.PI * radius;
  const totalLength = circumference; 
  const progressFactor = Math.min(percentage / 100, 1);
  const progressDash = totalLength * progressFactor;
  const strokeDashoffset = totalLength - progressDash;
  
  const rotation = 90; 

  return (
    <View style={{ width: radius * 2, height: radius * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        style={{ transform: [{ rotate: `${rotation}deg` }] }}
      >
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color1} />
            <Stop offset="100%" stopColor={color2} />
          </LinearGradient>
        </Defs>

        {/* Фоновый круг (темный цвет) */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="#444444" 
          strokeWidth={strokeWidth}
        />

        {/* Индикатор прогресса (цветная часть) */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="url(#gradient)" 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={totalLength}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      
      {/* Отображение процента заполнения внутри круга */}
      <View style={styles.gaugeInnerTextContainer}>
          <Text style={styles.gaugeInnerText}>{percentage}%</Text>
      </View>
    </View>
  );
};

// -----------------------------------------------------------
// 2. Компонент Карточки Показателей (MetricCard)
// -----------------------------------------------------------
const MetricCard = ({ title, value, changeValue, changeText, percentage, color1, color2 }) => (
  <View style={styles.metricCard}>
    
    <Text style={styles.metricCardTitle}>{title}</Text> 

    {/* 2. Круговой Индикатор с внутренним текстом */}
    <View style={styles.gaugeCenterContainer}>
      <CircularGauge
        percentage={percentage}
        color1={color1}
        color2={color2}
        radius={50} 
        strokeWidth={10}
      />
    </View>

    {/* 4. Значение Изменения (7% / 3%) */}
    <View style={styles.changeRow}>
        {/* Значение изменения */}
        <Text style={styles.metricChangeValueHighlighted}>{changeValue}</Text>
        {/* Unicode стрелка */}
        <Text style={styles.changeArrowUnicode}>{' \u2197'}</Text>
    </View>
    
    {/* Текст Изменения */}
    <Text style={styles.metricChangeText}>{changeText}</Text>
  </View>
);

// -----------------------------------------------------------
// 3. Компонент Карточки ИИ-Анализа (AnalysisCard)
// -----------------------------------------------------------
const AnalysisCard = ({ title, description, isDone = true }) => (
  <View style={styles.analysisCard}>
    <Text style={styles.analysisTitle}>{title}</Text>
    <Text style={styles.analysisDescription}>
      {description}
    </Text>
    <TouchableOpacity
      style={[
        styles.actionButton,
        isDone ? styles.actionButtonDone : styles.actionButtonPending
      ]}
      onPress={() => console.log('Action Pressed')}
    >
      <Icon
        name={isDone ? "checkmark-circle" : "alert-circle"}
        size={18}
        color="#F9F9F9"
        style={styles.checkIcon}
      />
      <Text style={styles.buttonText}>{isDone ? 'Выполнено' : 'Не выполнено'}</Text>
    </TouchableOpacity>
  </View>
);

// -----------------------------------------------------------
// 6. Основной Компонент Экрана (HomeScreen)
// -----------------------------------------------------------
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  const topPadding = Math.max(insets.top, 15); 
  const navBarHeight = insets.bottom;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />
      
      <ScrollView
        style={[styles.scrollView]}
        contentContainerStyle={{ 
            paddingTop: topPadding, 
            paddingBottom: navBarHeight - 25
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Дэшборд</Text>
        </View>

        {/* Секция Показателей */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Влажность"
            value="15%" 
            changeValue="7%" 
            changeText="Increase compared to last week" 
            percentage={75} 
            color1="#8234F7" 
            color2="#e2dbffff" 
          />
          <MetricCard
            title="Температура"
            value="23%" 
            changeValue="3%" 
            changeText="Increase compared to last week"
            percentage={40} 
            color1="#8234F7" 
            color2="#e2dbffff"
          />
        </View>

        {/* Секция ИИ-Анализа */}
        <Text style={styles.aiAnalysisTitle}>ИИ-анализ</Text>
        <View style={styles.analysisContainer}>
          <AnalysisCard
            title="Увеличьте температуру на +3°C"
            description="Рассматривается для комфорта для того, чтобы была комфортная температура..."
            isDone={false} 
          />
          <AnalysisCard
            title="Увеличьте температуру на +3°C"
            description="Нужно увеличить температуру для того, чтобы была комфортная температура..."
            isDone={true}
          />
          <AnalysisCard
            title="Увеличьте влажность на +3°C"
            description="Нужно увеличить влажность для того, чтобы была комфортная температура..."
            isDone={true}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------
// 7. Стили (Styles) 
// -----------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E', 
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9F9F9',
  },

  // Стили для Кругового Индикатора
  gaugeInnerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInnerText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#F9F9F9',
  },

  // Стили для Показателей
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricCard: {
    width: (screenWidth / 2) - 22, 
    backgroundColor: '#2D2D2D', 
    borderRadius: 15,
    padding: 15,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  metricCardTitle: {
    fontSize: 16,
    color: '#F9F9F9',
    fontWeight: '600',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  gaugeCenterContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5, 
    alignSelf: 'flex-start', 
  },
  
  changeArrowUnicode: {
    fontSize: 22, 
    color: '#25CD25', 
    fontWeight: 'bold', 
    marginLeft: 3,
  },
  
  metricChangeValueHighlighted: {
    fontSize: 23, 
    color: '#F9F9F9',
    fontWeight: 'bold',
  },
  metricChangeText: {
    fontSize: 13,
    color: '#BDBDBD',
    alignSelf: 'flex-start',
  },

  // Стили для ИИ-Анализа
  aiAnalysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F9F9F9',
    marginBottom: 15,
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisCard: {
    backgroundColor: '#2D2D2D',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9F9F9',
    marginBottom: 5,
  },
  analysisDescription: {
    fontSize: 13,
    color: '#BDBDBD',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  actionButtonDone: {
    backgroundColor: '#25CD25', 
  },
  actionButtonPending: {
    backgroundColor: '#8234F7', 
  },
  checkIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: '#F9F9F9',
    fontWeight: 'bold',
    fontSize: 14,
  },
});