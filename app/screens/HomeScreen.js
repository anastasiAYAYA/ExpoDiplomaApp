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

// --- ЦВЕТА ---
const accentColor = '#8234F7';   // Фиолетовый (остается для кнопок и градиентов)
const positiveColor = '#25CD25'; // Зеленый (для положительного +)
const negativeColor = '#FF9D00'; // Оранжевый (для отрицательного -)

// -----------------------------------------------------------
// 1. Компонент Кругового Индикатора (CircularGauge)
// -----------------------------------------------------------
const CircularGauge = ({ percentage, unit, color1, color2, radius = 50, strokeWidth = 10 }) => {
  const circumference = 2 * Math.PI * radius;
  const totalLength = circumference; 
  const roundedPercentage = Math.round(percentage); 
  const progressFactor = Math.min(percentage / 100, 1);
  const progressDash = totalLength * progressFactor;
  const strokeDashoffset = totalLength - progressDash;
  
  const rotation = 90; 
  const innerRadius = radius - strokeWidth / 2;

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
          r={innerRadius}
          fill="none"
          stroke="#444444" 
          strokeWidth={strokeWidth}
        />

        {/* Индикатор прогресса (цветная часть) */}
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="none"
          stroke="url(#gradient)" 
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={totalLength}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      
      {/* Отображение значения и единицы измерения */}
      <View style={styles.gaugeInnerTextContainer}>
          <Text style={styles.gaugeInnerText}>
              {roundedPercentage}
              {unit}
          </Text>
      </View>
    </View>
  );
};

// -----------------------------------------------------------
// 2. Компонент Карточки Показателей (MetricCard)
// -----------------------------------------------------------
const MetricCard = ({ title, changeText, percentage, unit, isPositiveChange, color1, color2 }) => {
  
  // ИЗМЕНЕНИЕ ЗДЕСЬ: Если isPositiveChange false, берем оранжевый (negativeColor)
  const changeColor = isPositiveChange ? positiveColor : negativeColor;
  
  return (
    <View style={styles.metricCard}>
      
      <Text style={styles.metricCardTitle}>{title}</Text> 

      {/* 2. Круговой Индикатор */}
      <View style={styles.gaugeCenterContainer}>
        <CircularGauge
          percentage={percentage}
          unit={unit} 
          color1={color1}
          color2={color2}
          radius={50} 
          strokeWidth={10}
        />
      </View>
      <View style={styles.changeRow}>
          <Text style={styles.metricChangeText}>
              Изменилось на 
              <Text style={{ color: changeColor, fontWeight: 'bold' }}>
                  {' '}{changeText}
              </Text>
          </Text>
      </View>
    </View>
  );
};

// -----------------------------------------------------------
// 3. Компонент Карточки ИИ-Анализа (AnalysisCard)
// -----------------------------------------------------------
const AnalysisCard = ({ title, description, isDone = true }) => {
  // Используем accentColor для кнопок, чтобы сохранить стиль
  
  return (
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
};

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
            paddingBottom: navBarHeight + 20 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Дэшборд</Text>
          <Icon name="ellipsis-vertical" size={24} color="#F9F9F9" />
        </View>

        {/* Секция Показателей */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Влажность"
            changeText=" +1,8%" 
            percentage={75.7} 
            unit="%" 
            isPositiveChange={true} 
            color1={accentColor} 
            color2="#e2dbffff" 
          />
          <MetricCard
            title="Температура"
            changeText=" -3,5%"
            percentage={18.4} 
            unit="°C" 
            isPositiveChange={false} 
            color1={accentColor} 
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
    fontSize: 18, 
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
    alignItems: 'center', 
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
    alignSelf: 'flex-start',
  },

  metricChangeText: {
    fontSize: 14,
    color: '#BDBDBD', 
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
    backgroundColor: positiveColor, 
  },
  actionButtonPending: {
    backgroundColor: accentColor, 
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