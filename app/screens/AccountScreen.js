import React, { useState, useMemo } from 'react'; // Импортируем useMemo
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// --- Обновленные Данные для секции "Роли пользователей" (БОЛЬШЕ ДАННЫХ) ---
const ALL_USER_ROLES = [
  { id: '1', name: 'Kseniya Kruchina', status: 'Онлайн', role: 'DevOps Engineer', icon: 'wrench' },
  { id: '2', name: 'Artur Kurbanov', status: 'Оффлайн', role: 'Администратор', icon: 'account-cog' },
  { id: '3', name: 'Anastasiya Sibirtseva', status: 'Онлайн', role: 'Product Manager', icon: 'lightbulb-on' },
  { id: '4', name: 'Ivan Petrov', status: 'Оффлайн', role: 'Менеджер Продаж', icon: 'cash-multiple' },
  { id: '5', name: 'Elena Sidorova', status: 'Онлайн', role: 'UI/UX Дизайнер', icon: 'palette' },
  { id: '6', name: 'Sergey Volkov', status: 'Онлайн', role: 'Backend Dev', icon: 'code-tags' },
  { id: '7', name: 'Olga Kabanova', status: 'Оффлайн', role: 'PR Менеджер', icon: 'bullhorn' },
  { id: '8', name: 'Dmitry Pirogov', status: 'Онлайн', role: 'Финансист', icon: 'currency-usd' },
];

// --- Данные для секции "История входа" (БОЛЬШЕ ДАННЫХ) ---
const ALL_LOGIN_HISTORY = [
  { id: 'h1', user: 'Kseniya Kruchina', role: 'Engineer', action: 'Вошла в систему', time: '12:07:02' },
  { id: 'h2', user: 'Arthur Kurbanov', role: 'Admin', action: 'Включил датчик влажности', time: '12:07:02' },
  { id: 'h3', user: 'Anastasiya Sibirseva', role: 'Product', action: 'Скачала месячный отчет', time: '12:07:02' },
  { id: 'h4', user: 'Ivan Petrov', role: 'Manager', action: 'Создал заявку на отпуск', time: '12:06:55' },
  { id: 'h5', user: 'Elena Sidorova', role: 'Designer', action: 'Загрузила новые ассеты', time: '12:06:40' },
  { id: 'h6', user: 'Sergey Volkov', role: 'Backend', action: 'Обновил API-ключ', time: '12:06:20' },
  { id: 'h7', user: 'Olga Kabanova', role: 'PR', action: 'Отправила рассылку СМИ', time: '12:06:10' },
  { id: 'h8', user: 'Dmitry Pirogov', role: 'Finance', action: 'Утвердил бюджет', time: '12:05:59' },
  { id: 'h9', user: 'Kseniya Kruchina', role: 'Engineer', action: 'Вышла из системы', time: '12:05:40' },
];

const MAX_DISPLAY_COUNT = 5; // Ограничение на количество отображаемых элементов

// --- Цветовая Палитра ---
const COLORS = {
    BACKGROUND: '#1E1E1E',
    CARD: '#2A2A2D',
    TEXT_PRIMARY: '#EBEBEB',
    TEXT_SECONDARY: '#AAAAAA',
    DIVIDER: '#2C2C2C',
    ACCENT_ONLINE: '#8234F7', 
    ACCENT_OFFLINE: '#4A4A4A', 
    LINK: '#8234F7', // Цвет ссылки для "Показать больше"
};

// --- Компонент кнопки действия ---
const ActionButton = ({ text, color }) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]}>
    <Text style={styles.actionButtonText}>{text}</Text>
  </TouchableOpacity>
);

// --- Компонент кнопки "Показать больше/Свернуть" ---
const ShowMoreButton = ({ onPress, isExpanded, totalCount, displayCount }) => {
    const text = isExpanded 
        ? 'Свернуть' 
        : `Показать все ${totalCount} записей`;
    const icon = isExpanded ? 'chevron-up' : 'chevron-right';
    
    // Если всего элементов меньше или равно лимиту, кнопку не показываем.
    if (totalCount <= displayCount && !isExpanded) {
        return <View style={{ height: 10 }} />;
    }

    return (
        <View style={styles.showMoreContainer}>
            <TouchableOpacity style={styles.showMoreButton} onPress={onPress}>
                <Text style={styles.showMoreText}>
                    {text}
                </Text>
                <MaterialCommunityIcons 
                    name={icon} 
                    size={20} 
                    color={COLORS.LINK} 
                    style={{ marginLeft: 5 }} 
                />
            </TouchableOpacity>
        </View>
    );
};


// --- Основной Компонент Экрана ---
const AccountScreen = () => {
    const insets = useSafeAreaInsets();
    
    // Состояния для отслеживания, сколько элементов показывать
    const [showAllRoles, setShowAllRoles] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    
    // 🔥🔥 ИСПОЛЬЗУЕМ useMemo для добавления стиля к данным ОДИН РАЗ (Восстанавливаем дизайн) 🔥🔥
    const styledUserRoles = useMemo(() => {
        return ALL_USER_ROLES.map(role => {
            const color = role.status === 'Онлайн' ? COLORS.ACCENT_ONLINE : COLORS.ACCENT_OFFLINE;
            return {...role, color};
        });
    }, []);

    // Отфильтрованные данные (со стилями)
    const userRolesData = showAllRoles ? styledUserRoles : styledUserRoles.slice(0, MAX_DISPLAY_COUNT);
    const loginHistoryData = showAllHistory ? ALL_LOGIN_HISTORY : ALL_LOGIN_HISTORY.slice(0, MAX_DISPLAY_COUNT);

  // Рендер элемента "Роли пользователей"
  const renderUserRoleItem = ({ item }) => (
    <View style={styles.roleItem}>
      <View style={styles.roleInfo}>
        <MaterialCommunityIcons name="account-tie" size={28} color={COLORS.TEXT_PRIMARY} style={{ marginRight: 15 }} />
        <View> 
          <Text style={styles.rolePrimaryText} numberOfLines={1}>{item.role}</Text>
          <Text style={styles.roleSecondaryText_Enhanced} numberOfLines={1}>{item.name}</Text>
        </View>
      </View>
      <View style={styles.roleButtons}>
        {/* 🔥🔥 Используем item.color, который был добавлен в styledUserRoles 🔥🔥 */}
        <ActionButton text={item.status} color={item.color} /> 
      </View>
    </View>
  );

  // Рендер элемента "История входа"
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyRow}> 
      <View style={styles.historyColUser}>
        <MaterialCommunityIcons 
            name="account-circle-outline" 
            size={18} 
            color={COLORS.TEXT_SECONDARY} 
            style={styles.historyIcon} 
        />
        <View style={{ flexShrink: 1 }}>
            <Text style={styles.historyTextRole} numberOfLines={1}>{item.role}</Text>
            <Text style={styles.historyTextUser} numberOfLines={1}>{item.user}</Text> 
        </View>
      </View>
      
      <Text style={styles.historyTextAction} numberOfLines={2}>{item.action}</Text>
      <Text style={styles.historyTextTime} numberOfLines={1}>{item.time}</Text>
    </View>
  );

  // Компонент футера для Ролей
  const RolesFooter = () => (
    <ShowMoreButton 
        onPress={() => setShowAllRoles(prev => !prev)} 
        isExpanded={showAllRoles}
        totalCount={ALL_USER_ROLES.length}
        displayCount={MAX_DISPLAY_COUNT}
    />
  );

  // Компонент футера для Истории
  const HistoryFooter = () => (
    <ShowMoreButton 
        onPress={() => setShowAllHistory(prev => !prev)} 
        isExpanded={showAllHistory}
        totalCount={ALL_LOGIN_HISTORY.length}
        displayCount={MAX_DISPLAY_COUNT}
    />
  );


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 

      <ScrollView style={styles.contentArea}>
        
        {/* --- Секция: Роли пользователей --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Роли пользователей</Text>
          <View style={styles.roleListContainer}>
            <FlatList
              data={userRolesData} // Используем данные со стилями
              renderItem={renderUserRoleItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={RolesFooter} // Условный футер
              ListHeaderComponent={() => <View style={{ height: 10 }} />}
            />
          </View>
        </View>
        
        {/* --- Секция: История входа --- */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>История входа</Text>
  
  <View style={styles.historyTableContainer}>
    
    {/* Заголовки */}
    <View style={styles.historyHeader}>
        <Text style={[styles.historyHeaderText, styles.historyColUser]}>Пользователь</Text>
        <Text style={[styles.historyHeaderText, styles.historyColActionHeader]}>Действие</Text>
        <Text style={[styles.historyHeaderText, styles.historyHeaderTextTime]}>Время</Text>
    </View>
    
    {/* Тело таблицы */}
    <FlatList
        data={loginHistoryData}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={HistoryFooter}
        ListHeaderComponent={() => <View style={{ height: 0 }} />}
    />

  </View>
</View>
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
};

// --- Стили ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentArea: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
  },

  // Общий разделитель 
  separator: {
    height: 1,
    backgroundColor: COLORS.DIVIDER,
    marginHorizontal: 15,
  },

  // 🔥 Стили для кнопки "Показать больше/Свернуть" 🔥
  showMoreContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 5,
  },
  showMoreText: {
    color: COLORS.LINK,
    fontSize: 14,
    fontWeight: '600',
  },
  // Конец стилей для "Показать больше"

  // Секция "Роли пользователей"
  roleListContainer: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    overflow: 'hidden',
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.6, 
  },
  rolePrimaryText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700', 
    lineHeight: 20,
  },
  roleSecondaryText_Enhanced: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500', 
    lineHeight: 18,
  },
  roleButtons: {
    flexDirection: 'row',
    flex: 0.4, 
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Секция "История Входа"
  historyTableContainer: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    overflow: 'hidden',
  },
  historyColActionHeader: {
  flex: 1, 
  paddingRight: 0,
  marginLeft: 40, // Сдвигаем только заголовок "Действие" вправо
},
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.CARD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  historyHeaderText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  historyHeaderTextTime: {
    textAlign: 'right',
  },

  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14, 
    paddingHorizontal: 12,
  },

  historyColUser: {
    flex: 1.2, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10, 
  },
  historyIcon: {
    marginRight: 8, 
  },
  historyTextRole: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  historyTextUser: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },

  historyColAction: {
    flex: 1.8, 
    paddingRight: 10,
  },
  historyTextAction: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    flexShrink: 1,
  },
  
  historyTextTime: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '400',
    flex: 0.7, 
    textAlign: 'right',
  },
});

export default AccountScreen;