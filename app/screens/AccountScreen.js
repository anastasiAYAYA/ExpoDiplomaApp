import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    FlatList, 
    ActivityIndicator, 
    Alert, 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

// --- Константы API ---
const BASE_URL = 'https://diploma-project-29973543489.europe-west1.run.app';
const API_ENDPOINTS = {
    users: `${BASE_URL}/api/users`,
    logs: `${BASE_URL}/api/logs?limit=20`, 
};

const MAX_DISPLAY_COUNT = 5; 

// --- Цветовая Палитра ---
const COLORS = {
    BACKGROUND: '#1E1E1E',
    CARD: '#2A2A2D',
    TEXT_PRIMARY: '#EBEBEB',
    TEXT_SECONDARY: '#AAAAAA',
    DIVIDER: '#2C2C2C',
    ACCENT_ONLINE: '#8234F7', 
    ACCENT_OFFLINE: '#4A4A4A', 
    LINK: '#8234F7', 
    SHADOW_COLOR: '#000000', 
    EXPAND_BG: '#3A3A3D', 
    ACCENT_PURPLE_LIGHT: '#8234F7', 
};

// --- Компонент кнопки действия ---
const ActionButton = ({ text, color }) => (
    <View style={[styles.actionButton, { backgroundColor: color }]}>
      <Text style={styles.actionButtonText}>{text}</Text>
    </View>
);

// --- Компонент кнопки "Показать больше/Свернуть" ---
const ShowMoreButton = ({ onPress, isExpanded, totalCount, displayCount }) => {
    const text = isExpanded 
        ? 'Свернуть' 
        : `Показать все ${totalCount} записей`;
    const icon = isExpanded ? 'chevron-up' : 'chevron-right';
    
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
    
    const [allUserRoles, setAllUserRoles] = useState([]);
    const [allLoginHistory, setAllLoginHistory] = useState([]); 
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    
    const [expandedLogId, setExpandedLogId] = useState(null); 
    
    const [showAllRoles, setShowAllRoles] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    
    const toggleLogExpansion = useCallback((id) => {
        setExpandedLogId(prevId => (prevId === id ? null : id));
    }, []);

    const fetchUsers = useCallback(async () => {
        setIsLoadingRoles(true);
        try {
            const response = await fetch(API_ENDPOINTS.users);
            const data = await response.json();
            
            setAllUserRoles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Ошибка загрузки пользователей:', e);
            Alert.alert('Ошибка', 'Не удалось загрузить список пользователей.');
            setAllUserRoles([]);
        } finally {
            setIsLoadingRoles(false);
        }
    }, []);

    const fetchLogs = useCallback(async () => {
        setIsLoadingHistory(true);
        try {
            const response = await fetch(API_ENDPOINTS.logs);
            const data = await response.json();
            
            setAllLoginHistory(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Ошибка загрузки логов:', e);
            Alert.alert('Ошибка', 'Не удалось загрузить Журнал Аудита.');
            setAllLoginHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchLogs();
    }, [fetchUsers, fetchLogs]);

    const styledUserRoles = useMemo(() => {
        return allUserRoles.map(user => {
            const isOnline = user.status === 'Онлайн';
            
            const statusText = isOnline ? 'Онлайн' : 'Оффлайн';
            const color = isOnline ? COLORS.ACCENT_ONLINE : COLORS.ACCENT_OFFLINE;
            
            return {
                id: user.id ? user.id.toString() : Math.random().toString(), 
                name: user.name || 'Неизвестный пользователь', 
                status: statusText, 
                role: user.role || 'Пользователь', 
                color: color,
                icon: user.role === 'Администратор' ? 'account-cog' : 'account-tie', 
            };
        });
    }, [allUserRoles]);

    const styledLoginHistory = useMemo(() => {
        return allLoginHistory.map(log => ({
            id: log.id ? log.id.toString() : Math.random().toString(),
            user: log.user || 'Н/Д',
            role: log.role || 'Пользователь', 
            action: log.action || 'Неизвестное действие',
            time: log.time || 'Н/Д', 
        }));
    }, [allLoginHistory]);


    const userRolesData = showAllRoles ? styledUserRoles : styledUserRoles.slice(0, MAX_DISPLAY_COUNT);
    const loginHistoryData = showAllHistory ? styledLoginHistory : styledLoginHistory.slice(0, MAX_DISPLAY_COUNT);

    const renderUserRoleItem = ({ item }) => (
        <View style={styles.roleItem}>
            <View style={styles.roleInfo}>
                <MaterialCommunityIcons name={item.icon} size={28} color={COLORS.TEXT_PRIMARY} style={{ marginRight: 15 }} />
                <View style={{ flexShrink: 1 }}> 
                    <Text style={styles.rolePrimaryText} numberOfLines={1}>{item.role}</Text>
                    <Text style={styles.roleSecondaryText_Enhanced} numberOfLines={1}>{item.name}</Text>
                </View>
            </View>
            <View style={styles.roleButtons}>
                <ActionButton text={item.status} color={item.color} /> 
            </View>
        </View>
    );

    const renderHistoryItem = ({ item }) => {
        const isExpanded = item.id === expandedLogId;
        const iconName = isExpanded ? 'chevron-up' : 'chevron-down';

        return (
            <View>
                {/* --- Основная строка (заголовок) --- */}
                <TouchableOpacity 
                    style={[
                        styles.historyRow, 
                        isExpanded && { 
                            borderBottomLeftRadius: 0, 
                            borderBottomRightRadius: 0, 
                            borderBottomWidth: 0 
                        }
                    ]} 
                    onPress={() => toggleLogExpansion(item.id)}
                > 
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
                    
                    {/* В режиме заголовка - обрезаем текст действия */}
                    <Text style={styles.historyTextAction} numberOfLines={isExpanded ? 1 : 2}>{item.action}</Text> 
                    
                    {/* Объединенный контейнер для времени и иконки */}
                    <View style={styles.historyTimeAndIcon}>
                        <Text style={styles.historyTextTime} numberOfLines={1}>{item.time}</Text>
                        <MaterialCommunityIcons 
                            name={iconName} 
                            size={20} 
                            color={isExpanded ? COLORS.ACCENT_PURPLE_LIGHT : COLORS.TEXT_SECONDARY} 
                            style={styles.expandIcon} 
                        />
                    </View>
                </TouchableOpacity>

                {/* --- Раскрывающееся содержимое (полное действие) --- */}
                {isExpanded && (
                    <View style={historyStyles.expandedContent}>
                        <View style={historyStyles.infoBlock}>
                            <Text style={historyStyles.infoLabel}>Действие:</Text>
                            <Text style={historyStyles.infoText}>{item.action}</Text>
                        </View>

                        <View style={historyStyles.infoBlock}>
                            <Text style={historyStyles.infoLabel}>Пользователь:</Text>
                            <Text style={historyStyles.infoText}>{item.user} ({item.role})</Text>
                        </View>

                        <View style={historyStyles.infoBlock}>
                            <Text style={historyStyles.infoLabel}>Время:</Text>
                            <Text style={historyStyles.infoText}>{item.time}</Text>
                        </View>
                    </View>
                )}
                {/* Если элемент раскрыт, не показываем обычный разделитель, т.к. его заменяет рамка expandedContent */}
                {!isExpanded && (
                    <View style={styles.historySeparator} />
                )}
            </View>
        );
    };

    const RolesFooter = () => (
        <ShowMoreButton 
            onPress={() => setShowAllRoles(prev => !prev)} 
            isExpanded={showAllRoles}
            totalCount={styledUserRoles.length}
            displayCount={MAX_DISPLAY_COUNT}
        />
    );

    const HistoryFooter = () => (
        <ShowMoreButton 
            onPress={() => setShowAllHistory(prev => !prev)} 
            isExpanded={showAllHistory}
            totalCount={styledLoginHistory.length}
            displayCount={MAX_DISPLAY_COUNT}
        />
    );

    const renderUserRolesSection = () => {
        if (isLoadingRoles) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.ACCENT_ONLINE} />
                    <Text style={styles.loadingText}>Загрузка пользователей...</Text>
                </View>
            );
        }
        
        return (
            <View style={styles.roleListContainer}>
                <FlatList
                    data={userRolesData} 
                    renderItem={renderUserRoleItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListFooterComponent={RolesFooter} 
                    ListHeaderComponent={() => <View style={{ height: 10 }} />}
                />
            </View>
        );
    };

    const renderHistorySection = () => {
        if (isLoadingHistory) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.ACCENT_ONLINE} />
                    <Text style={styles.loadingText}>Загрузка Журнала Аудита...</Text>
                </View>
            );
        }

        return (
            <View style={styles.historyTableContainer}>
                
                {/* Заголовки */}
                <View style={styles.historyHeader}>
                    <Text style={[styles.historyHeaderText, styles.historyColUserHeader]}>Пользователь</Text>
                    <Text style={[styles.historyHeaderText, styles.historyColActionHeader]}>Действие</Text> 
                    <Text style={[styles.historyHeaderText, styles.historyColTimeHeader]}>Время</Text> 
                </View>
                
                <FlatList
                    data={loginHistoryData}
                    renderItem={renderHistoryItem}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ListFooterComponent={HistoryFooter}
                    ListHeaderComponent={() => <View style={{ height: 0 }} />}
                />

            </View>
        );
    };


    return (
        <View style={[styles.container, { paddingTop: insets.top }]}> 

            <ScrollView style={styles.contentArea}>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Роли пользователей</Text>
                    {renderUserRolesSection()}
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Журнал Аудита</Text>
                    {renderHistorySection()}
                </View>
                
                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
};

const historyStyles = StyleSheet.create({
    expandedContent: {
        backgroundColor: COLORS.EXPAND_BG,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomLeftRadius: 0, 
        borderBottomRightRadius: 0,
        borderTopWidth: 2,
        borderColor: COLORS.ACCENT_PURPLE_LIGHT + '70', 
    },
    infoBlock: {
        marginBottom: 10,
    },
    infoLabel: {
        color: COLORS.TEXT_SECONDARY,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 0,
    },
    infoText: {
        color: COLORS.TEXT_PRIMARY,
        fontSize: 16,
        fontWeight: '500', 
        lineHeight: 22,
    },
});


// --- Стили Экрана ---
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

    separator: {
        height: 1,
        backgroundColor: COLORS.DIVIDER,
        marginHorizontal: 15,
    },
    historySeparator: {
        height: 1,
        backgroundColor: COLORS.DIVIDER,
        marginHorizontal: 15,
    },

    loadingContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.CARD,
        borderRadius: 14,
    },
    loadingText: {
        color: COLORS.TEXT_SECONDARY,
        marginTop: 10,
        fontSize: 14,
    },

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
    
    // Секция "Журнал Аудита"
    historyTableContainer: {
        backgroundColor: COLORS.CARD,
        borderRadius: 14,
        overflow: 'hidden',
    },

    historyColUserHeader: {
        flex: 1.2, 
        paddingRight: 5, 
        paddingLeft: 3, 
    },
    historyColActionHeader: {
        flex: 1.5, 
        marginLeft: 45, 
    },
    historyColTimeHeader: {
        flex: 0.8, 
        textAlign: 'right', 
        marginRight: 15, 
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

    historyTextAction: {
        color: COLORS.TEXT_PRIMARY,
        fontSize: 14,
        fontWeight: '400',
        flex: 1.5, 
        flexShrink: 1,
    },
    
    historyTimeAndIcon: {
        flex: 0.8, 
        flexDirection: 'row',
        justifyContent: 'flex-end', 
        alignItems: 'center',
        paddingLeft: 10,
    },
    historyTextTime: {
        color: COLORS.TEXT_SECONDARY,
        fontSize: 14,
        fontWeight: '400',
    },
    expandIcon: {
        marginLeft: 5, 
    },
});

export default AccountScreen;