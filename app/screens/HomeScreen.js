import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator, 
  Alert, 
} from 'react-native';


import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

// --- 1. КОНСТАНТЫ API ---
const BASE_URL = 'https://diploma-project-29973543489.europe-west1.run.app'; 
const API_ENDPOINTS = {
  dashboard: `${BASE_URL}/api/dashboard/stats`,
  notifications: `${BASE_URL}/api/notifications`,
  completeNotification: (id) => `${BASE_URL}/api/notifications/${id}/complete`,
};

// --- 2. ЦВЕТА ---
const accentColor = '#8234F7';   // Фиолетовый
const positiveColor = '#25CD25'; // Зеленый
const negativeColor = '#FF9D00'; // Оранжевый
const loadingColor = '#BBBBBB';  // Светло-серый для индикатора

// -----------------------------------------------------------
// 3. Компонент Кругового Индикатора (CircularGauge)
// -----------------------------------------------------------
const CircularGauge = ({ percentage, unit, color1, color2, radius = 50, strokeWidth = 10 }) => {
  const validPercentage = percentage !== null && !isNaN(percentage) ? percentage : 0;
  
  const circumference = 2 * Math.PI * radius;
  const totalLength = circumference; 
  const roundedValue = Math.round(validPercentage * 10) / 10;
  
  // Условный максимум для круга
  const maxGaugeValue = unit === '%' ? 100 : 30; 
  const progressFactor = Math.min(validPercentage / maxGaugeValue, 1);
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
              {roundedValue}
              {unit}
          </Text>
      </View>
    </View>
  );
};

// -----------------------------------------------------------
// 4. Компонент Карточки Показателей (MetricCard)
// -----------------------------------------------------------

const MetricCard = ({ title, value, unit, color1, color2, isLoading, changeValue }) => {
  
  // Определяем, является ли изменение положительным или отрицательным (0 считается положительным для простоты)
  const isPositiveChange = changeValue >= 0; 
  
  const changeColor = isPositiveChange ? positiveColor : negativeColor;
  
  // Форматирование: добавляем '+' или '-' и фиксируем до 1 знака после запятой, добавляем '%'
  const formattedChange = (isPositiveChange ? '+' : '') + changeValue.toFixed(1) + '%';
  
  return (
    <View style={styles.metricCard}>
      
      <Text style={styles.metricCardTitle}>{title}</Text> 

      {/* Круговой Индикатор */}
      <View style={styles.gaugeCenterContainer}>
        {isLoading ? (
          <View style={[styles.loadingContainer, { width: 100, height: 100 }]}>
            <ActivityIndicator size="large" color={loadingColor} />
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        ) : (
          <CircularGauge
            percentage={value}
            unit={unit} 
            color1={color1}
            color2={color2}
            radius={50} 
            strokeWidth={10}
          />
        )}
      </View>
      <View style={styles.changeRow}>
          <Text style={styles.metricChangeText}>
              Изменилось на 
              <Text style={{ color: changeColor, fontWeight: 'bold' }}>
                  {' '}{formattedChange}
              </Text>
          </Text>
      </View>
    </View>
  );
};

// -----------------------------------------------------------
// 5. Компонент Карточки ИИ-Анализа (AnalysisCard)
// -----------------------------------------------------------
const AnalysisCard = ({ id, title, message, status, onPress }) => {
  
  const isDone = status === 'completed'; 
  const buttonColor = isDone ? positiveColor : accentColor;
  
  return (
    <View style={styles.analysisCard}>
      <Text style={styles.analysisTitle}>{title}</Text>
      <Text style={styles.analysisDescription}>
        {message}
      </Text>
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: buttonColor }
        ]}
        onPress={onPress}
        disabled={isDone} 
      >
        <Icon
          name={isDone ? "checkmark-circle" : "alert-circle"}
          size={18}
          color="#F9F9F9"
          style={styles.checkIcon}
        />
        <Text style={styles.buttonText}>{isDone ? 'Выполнено' : 'Отметить как выполненное'}</Text>
      </TouchableOpacity>
    </View>
  );
};


// -----------------------------------------------------------
// 6. Хук для Загрузки Данных (useFetchData)
// -----------------------------------------------------------
const useFetchData = (url, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json); 
    } catch (e) {
      console.error("Ошибка при загрузке данных:", url, e);
      setError(e.message);
      setData(initialData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, isLoading, error, setData, refetch: fetchData };
};


// -----------------------------------------------------------
// 7. Основной Компонент Экрана (HomeScreen)
// -----------------------------------------------------------
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  

  const initialDashboardData = { 
    avg_temperature: 0, 
    avg_humidity: 0, 
    temp_change: 0, 
    hum_change: 0, 
  };
  
  // --- Загрузка данных API ---
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError 
  } = useFetchData(API_ENDPOINTS.dashboard, initialDashboardData);
  
  const { 
    data: notifications, 
    isLoading: isAnalysisLoading,
    refetch: refetchNotifications,
    error: notificationsError
  } = useFetchData(API_ENDPOINTS.notifications, []);
  
  // Значения из сводки
  const humidity = dashboardData.avg_humidity || 0;
  const temperature = dashboardData.avg_temperature || 0;
  
  const humidityChange = dashboardData.hum_change || 0;
  const temperatureChange = dashboardData.temp_change || 0;
  
  const topPadding = Math.max(insets.top, 15); 
  const navBarHeight = insets.bottom;
  
  // Функция для отправки POST-запроса на выполнение совета
  const completeNotification = async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.completeNotification(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete notification: ${response.status}`);
      }

      // После успешного выполнения обновляем список уведомлений
      refetchNotifications(); 
      Alert.alert('Успех', 'Совет успешно отмечен как выполненный!');
    } catch (e) {
      console.error("Ошибка при выполнении совета:", e);
      Alert.alert('Ошибка', 'Не удалось отметить совет как выполненный.');
    }
  };


  // Отображение ошибки загрузки дашборда
  if (dashboardError) {
    return (
      <View style={styles.safeArea}>
        <Text style={styles.errorText}>
          Ошибка загрузки данных сводки: {dashboardError}
        </Text>
      </View>
    );
  }
  
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
            value={humidity}
            unit="%" 
            color1={accentColor} 
            color2="#e2dbffff" 
            isLoading={isDashboardLoading}
            changeValue={humidityChange} 
          />
          <MetricCard
            title="Температура"
            value={temperature}
            unit="°C" 
            color1={accentColor} 
            color2="#e2dbffff"
            isLoading={isDashboardLoading}
            changeValue={temperatureChange}
          />
        </View>

        {/* Секция ИИ-Анализа */}
        <Text style={styles.aiAnalysisTitle}>ИИ-анализ</Text>
        <View style={styles.analysisContainer}>
          {notificationsError ? (
            <Text style={styles.errorText}>Ошибка загрузки уведомлений.</Text>
          ) : isAnalysisLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={loadingColor} />
              <Text style={styles.loadingText}>Загрузка советов...</Text>
            </View>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((item) => (
              <AnalysisCard
                key={item.id}
                id={item.id}
                title={item.title || 'Нет заголовка'}
                message={item.message || 'Нет описания.'}
                status={item.status}
                onPress={() => completeNotification(item.id)}
              />
            ))
          ) : (
            <Text style={styles.noDataText}>Активных советов ИИ нет.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------
// 8. Стили (Styles) 
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
  checkIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: '#F9F9F9',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Стили для загрузки и ошибок
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: loadingColor,
    marginTop: 10,
    fontSize: 14,
  },
  noDataText: {
    color: '#BDBDBD',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 50,
  }
});