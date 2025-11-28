import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  ActivityIndicator, 
  Linking, 
  Alert, 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

// --- КОНСТАНТЫ API ---
const BASE_URL = 'https://diploma-project-29973543489.europe-west1.run.app';
const API_ENDPOINTS = {
  reports: `${BASE_URL}/api/reports`,
  downloadReport: (id) => `${BASE_URL}/api/reports/${id}/download?user_id=1`,
};

// Цвета
const GREEN = '#25CD25';
const VIOLET = '#8234F7'; 
const ORANGE = '#FF9D00'; 
const DARK_BG = '#1E1E1E'; 
const CARD_BG = '#2A2A2D'; 
const LOADING_COLOR = '#BBBBBB';

// -----------------------------------------------------------
// 1. Хук для Загрузки Данных (useFetchData)
// -----------------------------------------------------------
const useFetchData = (url, initialData = []) => {
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

  return { data, isLoading, error, refetch: fetchData };
};


// -----------------------------------------------------------
// 2. Вспомогательные компоненты
// -----------------------------------------------------------

const ReportSummaryCard = ({ title, iconColor, cardColor, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.summaryCard, { backgroundColor: cardColor }]}>
    <Ionicons name="document-text-outline" size={26} color={iconColor} />
    <View style={styles.summaryCardBottom}>
      <Text style={styles.summaryCardTitle}>{title.replace(' ', '\n')}</Text>
      <Feather name="download" size={20} color="#BBBBBB" />
    </View>
  </TouchableOpacity>
);

const DownloadItem = ({ report, iconColor, onDownloadPress }) => {
  
  let formattedDate = 'Дата неизвестна';

  if (report.report_date) {
    try {
        const dateObj = new Date(report.report_date); 

        if (!isNaN(dateObj.getTime())) { 
            const formatter = new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            formattedDate = formatter.format(dateObj);
        }
    } catch (e) {
        console.error("Ошибка форматирования даты:", e);
    }
  }

  return (
    <View style={styles.downloadItem}>
      <Ionicons name="document-text-outline" size={26} color={iconColor} />
      <View style={styles.downloadItemTextContainer}>
        <Text style={styles.downloadItemTitle}>{report.title || 'Отчет'}</Text>
        <Text style={styles.downloadItemDate}>{formattedDate}</Text>
      </View>
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => onDownloadPress(report.id, report.title)}
      >
        <Text style={styles.downloadButtonText}>Скачать</Text>
      </TouchableOpacity>
    </View>
  );
};

// -----------------------------------------------------------
// 3. Основной компонент экрана (AnalysisScreen)
// -----------------------------------------------------------
export default function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 15);
  const bottomPadding = insets.bottom + 20;

  // --- Загрузка списка отчетов ---
  const { 
    data: reports, 
    isLoading: isReportsLoading, 
    error: reportsError,
    refetch: refetchReports
  } = useFetchData(API_ENDPOINTS.reports, []);

  // Фильтрация для карточек (пример: Недельные и Месячные)
  // Мы можем посчитать количество, если API возвращает метки (labels)
  const weeklyReports = reports.filter(r => r.title && r.title.includes('Недельный'));
  const monthlyReports = reports.filter(r => r.title && r.title.includes('Месячный'));

  // --- Функция скачивания ---
  const handleDownload = async (reportId, reportTitle) => {
    // 1. Делаем запрос к API для получения ссылки и/или логирования
    let downloadUrl = null;
    try {
      const response = await fetch(API_ENDPOINTS.downloadReport(reportId));
      
      if (!response.ok) {
        throw new Error(`Failed to initiate download: ${response.status}`);
      }
      
      const data = await response.json();
      downloadUrl = data.download_url;

    } catch (e) {
      console.error(`Ошибка при подготовке скачивания ${reportTitle}:`, e);
      Alert.alert('Ошибка скачивания', `Не удалось подготовить файл ${reportTitle}.`);
      return;
    }
    
    // 2. Открываем ссылку для скачивания
    if (downloadUrl) {
      try {
        await Linking.openURL(downloadUrl);
        Alert.alert('Скачивание начато', `Отчет "${reportTitle}" открыт для загрузки.`);
      } catch (e) {
        console.error("Ошибка Linking:", e);
        Alert.alert('Ошибка', 'Не удалось открыть ссылку для скачивания.');
      }
    }
  };


  // --- Логика отображения контента ---
  const renderContent = () => {
    if (isReportsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LOADING_COLOR} />
          <Text style={styles.loadingText}>Загрузка отчетов...</Text>
        </View>
      );
    }
    
    if (reportsError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Ошибка: Не удалось загрузить список отчетов.
          </Text>
          <TouchableOpacity onPress={refetchReports} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Отображение контента
    return (
      <View>
        {/* Секция Отчеты (Карточки-итого) */}
        <Text style={styles.sectionTitle}>Отчеты</Text>
        <View style={styles.reportsGrid}>
          {/* Недельные отчеты: берем последний скачанный, если есть */}
          {weeklyReports.length > 0 && (
            <ReportSummaryCard 
              title={`Недельный отчет (${weeklyReports.length})`} 
              iconColor={GREEN}
              cardColor={CARD_BG}
              // Действие: скачиваем самый свежий недельный отчет (берем 0-й элемент, если API возвращает отсортированный список)
              onPress={() => handleDownload(weeklyReports[0].id, weeklyReports[0].title)}
            />
          )}
          
          {weeklyReports.length > 0 && monthlyReports.length > 0 && <View style={{ width: 12 }} />}
          
          {/* Месячные отчеты: берем последний скачанный, если есть */}
          {monthlyReports.length > 0 && (
            <ReportSummaryCard 
              title={`Месячный отчет (${monthlyReports.length})`} 
              iconColor={VIOLET}
              cardColor={CARD_BG}
              // Действие: скачиваем самый свежий месячный отчет
              onPress={() => handleDownload(monthlyReports[0].id, monthlyReports[0].title)}
            />
          )}

          {/* Если нет отчетов для отображения карточек */}
          {reports.length === 0 && (
            <Text style={styles.noDataText}>Нет доступных отчетов.</Text>
          )}

        </View>

        {/* Секция Список скачанных файлов */}
        <Text style={styles.sectionTitle}>История загрузок</Text>
        <View style={styles.downloadListContainer}>
          {reports.map((item) => (
            <DownloadItem
              key={item.id}
              report={item}
              iconColor={item.title && item.title.includes('Месячный') ? VIOLET : GREEN}
              onDownloadPress={handleDownload}
            />
          ))}
        </View>
      </View>
    );
  };

  // --- Рендер ---
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
        <Text style={styles.mainTitle}>Анализ</Text>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------
// 4. Стили
// -----------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  mainTitle: { 
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
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
    justifyContent: 'space-between',
    flexWrap: 'wrap', 
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    justifyContent: 'space-between',
    minWidth: (screenWidth / 2) - 22, 
  },
  summaryCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryCardTitle: {
    color: 'white',
    fontSize: 16,
    flexShrink: 1,
  },
  downloadListContainer: {
    marginTop: 0,
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
  // Стили для загрузки и ошибок
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: LOADING_COLOR,
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: ORANGE,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: VIOLET,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#BDBDBD',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
    width: '100%',
  }
});