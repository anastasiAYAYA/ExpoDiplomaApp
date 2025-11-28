import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    Modal, 
    TextInput, 
    FlatList, 
    ActivityIndicator, 
    Alert, 
} from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import Slider from '@react-native-community/slider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Константы API ---
const BASE_URL = 'https://diploma-project-29973543489.europe-west1.run.app';
const API_ENDPOINTS = {
    locations: `${BASE_URL}/api/locations`,
    sensors: (locationId) => `${BASE_URL}/api/sensors/${locationId}`,
    updateSensor: (sensorId) => `${BASE_URL}/api/sensors/${sensorId}?user_id=1`, // user_id=1 хардкод
};

// --- Цвета и константы ---
const COLORS = {
    background: '#1E1E1E',
    card: '#2A2A2D',
    primary: '#8234F7', 
    text: '#FFFFFF',
    textSecondary: 'grey',
    statusActive: '#25CD25', 
    statusInactive: '#FF9D00', 
    modalBackground: '#121212', 
    loading: '#BBBBBB',
};

// --- Вспомогательная функция для форматирования единиц ---
const getUnitLabel = (sensorType) => {
    switch (sensorType) {
        case 'Temperature': return '°C';
        case 'Humidity': return '%';
        default: return '';
    }
};

// ----------------------------------------------------------------
// --- Компоненты SearchableDropdown ---
// ----------------------------------------------------------------
const SearchableDropdown = ({ selectedOption, onSelect, options }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (option) => {
        onSelect(option);
        setModalVisible(false);
        setSearchQuery(''); 
    };
    
    const renderOption = ({ item }) => (
        <TouchableOpacity
            style={styles.optionItem}
            onPress={() => handleSelect(item)}
        >
            <Text style={styles.optionText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View>
            <TouchableOpacity 
                style={styles.cabinetSelectorContainer} 
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.cabinetSelectorText}>{selectedOption.name}</Text>
                <Feather name="chevron-down" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Выберите Локацию</Text>
                        <TouchableOpacity onPress={() => {setModalVisible(false); setSearchQuery('');}}>
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Найти кабинет или датчик..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true}
                    />
                    <FlatList
                        data={filteredOptions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderOption}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        ListEmptyComponent={() => (
                            <Text style={styles.emptyListText}>Ничего не найдено</Text>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
};

// ----------------------------------------------------------------
// --- Компонент SensorConfigCard (С кнопкой "Подтвердить") ---
// ----------------------------------------------------------------
const SensorConfigCard = ({ sensor, onUpdate, unit }) => {
    // Инициализация состояний значениями из API
    const [targetValue, setTargetValue] = useState(sensor.target_value);
    const [isActive, setIsActive] = useState(sensor.is_active);
    const [isUpdating, setIsUpdating] = useState(false);

    // --- Установка лимитов слайдера ---
    // Для температуры - 40, для влажности - 100
    const sliderMin = 0;
    const sliderMax = unit === '°C' ? 40 : 100; 

    // Локальные состояния для отслеживания изменений:
    const roundTo1Decimal = (value) => Math.round(value * 10) / 10;
    
    const hasSliderChanged = roundTo1Decimal(targetValue) !== roundTo1Decimal(sensor.target_value);
    const hasSwitchChanged = isActive !== sensor.is_active;
    const isSaveButtonVisible = hasSliderChanged || hasSwitchChanged;


    // --- Функция для отправки изменений на сервер (PATCH) ---
    const handleUpdate = useCallback(async (targetToSend, activeToSend) => {
        setIsUpdating(true);
        
        try {
            const response = await fetch(API_ENDPOINTS.updateSensor(sensor.id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_active: activeToSend,
                    target_value: targetToSend
                })
            });

            if (!response.ok) {
                setTargetValue(sensor.target_value);
                setIsActive(sensor.is_active);
                throw new Error(`Ошибка обновления: ${response.status}`);
            }

            setTargetValue(targetToSend);
            setIsActive(activeToSend);

            onUpdate(); 

        } catch (e) {
            console.error(`Ошибка PATCH для датчика ${sensor.id}:`, e);
            Alert.alert('Ошибка', 'Не удалось обновить настройки датчика. Отмена изменений.');
        } finally {
            setIsUpdating(false);
        }
    }, [sensor.id, sensor.target_value, sensor.is_active, onUpdate, targetValue, isActive]);


    // Обработчик тумблера (отправка немедленно)
    const toggleSwitch = () => {
        const newState = !isActive;
        handleUpdate(targetValue, newState); 
    };

    // Обработчик кнопки "Подтвердить"
    const handleSave = () => {
        handleUpdate(targetValue, isActive); 
    };
    
    // --- Визуальные параметры ---
    const statusColor = isActive ? COLORS.statusActive : COLORS.statusInactive;
    const statusText = isActive ? 'Включено' : 'Выключено';
    const displayValueColor = isActive ? COLORS.text : COLORS.textSecondary;
    
    const formattedMainValue = `${sensor.last_value ? sensor.last_value.toFixed(1) : 'Н/Д'}${unit}`;
    const formattedTargetLabel = `Текущая цель: ${targetValue.toFixed(1)}${unit}`;

    return (
        <View style={styles.card}>
            <View style={styles.titleStatusRow}>
                <Text style={styles.cardTitle}>{sensor.name}</Text>
                <View style={styles.statusRow}>
                    {isUpdating 
                        ? <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 4 }} />
                        : <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                    }
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {isUpdating ? 'Обновление...' : statusText}
                    </Text>
                </View>
            </View>

            <Text style={[styles.mainValue, {color: displayValueColor}]}>{formattedMainValue}</Text>
            <Text style={styles.targetLabel}>{formattedTargetLabel}</Text>
            
            <Text style={styles.controlLabel}>Регулировка целевого значения:</Text>
            <Slider
                style={styles.slider}
                minimumValue={sliderMin}
                maximumValue={sliderMax}
                value={targetValue} 
                onValueChange={setTargetValue} 
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.text + '50'}
                thumbTintColor={COLORS.primary}
                step={0.5} 
                disabled={!isActive || isUpdating}
            />
            <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>{sliderMin}{unit}</Text> 
                <Text style={styles.sliderLabel}>{sliderMax}{unit}</Text>
            </View>

            {/* --- КНОПКА ПОДТВЕРДИТЬ --- */}
            {isSaveButtonVisible && (
                <TouchableOpacity
                    style={[styles.saveButton, { opacity: isUpdating ? 0.6 : 1 }]}
                    onPress={handleSave}
                    disabled={isUpdating}
                >
                    <Feather name="check-circle" size={20} color={COLORS.text} style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Подтвердить</Text>
                </TouchableOpacity>
            )}
            {/* ------------------------- */}
            
            <View style={[styles.toggleRow, { marginTop: isSaveButtonVisible ? 10 : 0 }]}>
                <Text style={styles.toggleLabel}>Питание</Text>
                <Switch
                    trackColor={{ false: COLORS.text + '30', true: COLORS.primary + '50' }}
                    thumbColor={isActive ? COLORS.primary : COLORS.textSecondary}
                    onValueChange={toggleSwitch}
                    value={isActive}
                    style={styles.switchControl}
                    disabled={isUpdating}
                />
            </View>
        </View>
    );
};

// ----------------------------------------------------------------
// --- Основной экран с useSafeAreaInsets ---
// ----------------------------------------------------------------
const SensorsScreen = () => {
    const insets = useSafeAreaInsets();
    
    // 1. Состояние для локаций
    const [locations, setLocations] = useState([]);
    const [selectedCabinet, setSelectedCabinet] = useState(null); 
    const [isLocationsLoading, setIsLocationsLoading] = useState(true);

    // 2. Состояние для датчиков
    const [sensors, setSensors] = useState([]);
    const [isSensorsLoading, setIsSensorsLoading] = useState(false);

    // --- 1. Загрузка списка локаций (при первом рендере) ---
    useEffect(() => {
        const getLocations = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.locations);
                const data = await response.json();
                
                const formattedLocations = data.map(loc => ({ id: loc.id, name: loc.name }));
                setLocations(formattedLocations);

                if (formattedLocations.length > 0) {
                    setSelectedCabinet(formattedLocations[0]);
                }
            } catch (e) {
                console.error("Ошибка загрузки локаций:", e);
                Alert.alert('Ошибка', 'Не удалось загрузить список локаций.');
            } finally {
                setIsLocationsLoading(false);
            }
        };
        getLocations();
    }, []);

    // --- 2. Загрузка датчиков для выбранного кабинета ---
    const fetchSensors = useCallback(async (locationId) => {
        if (!locationId) return;

        setIsSensorsLoading(true);
        setSensors([]);
        try {
            const response = await fetch(API_ENDPOINTS.sensors(locationId));
            const data = await response.json();
            setSensors(data);
        } catch (e) {
            console.error("Ошибка загрузки датчиков:", e);
            Alert.alert('Ошибка', 'Не удалось загрузить датчики для выбранного кабинета.');
            setSensors([]);
        } finally {
            setIsSensorsLoading(false);
        }
    }, []);

    // Вызываем fetchSensors при изменении selectedCabinet
    useEffect(() => {
        if (selectedCabinet && selectedCabinet.id) {
            fetchSensors(selectedCabinet.id);
        }
    }, [selectedCabinet, fetchSensors]);
    
    const handleSelectCabinet = (cabinet) => {
        setSelectedCabinet(cabinet);
    };

    // --- Рендер контента ---
    const renderContent = () => {
        if (isLocationsLoading) {
            return <ActivityIndicator size="large" color={COLORS.loading} style={{ marginTop: 50 }} />;
        }

        if (!selectedCabinet) {
            return <Text style={styles.errorText}>Нет доступных локаций.</Text>;
        }

        if (isSensorsLoading) {
            return <ActivityIndicator size="large" color={COLORS.loading} style={{ marginTop: 50 }} />;
        }

        if (sensors.length === 0) {
            return <Text style={styles.errorText}>Датчики не найдены в {selectedCabinet.name}.</Text>;
        }

        return (
            <View>
                {sensors.map(sensor => (
                    <SensorConfigCard
                        key={sensor.id}
                        sensor={sensor}
                        onUpdate={() => fetchSensors(selectedCabinet.id)} 
                        unit={getUnitLabel(sensor.sensor_type.name)}
                    />
                ))}
            </View>
        );
    };


    return (
        <View style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={{
                    paddingTop: insets.top + 16, 
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.headerTitle}>Датчики</Text>

                {selectedCabinet && (
                    <SearchableDropdown 
                        selectedOption={selectedCabinet}
                        onSelect={handleSelectCabinet}
                        options={locations}
                    />
                )}
                
                {renderContent()}

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
};

// ----------------------------------------------------------------
// --- Стили ---
// ----------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 24, 
        fontWeight: 'bold',
        marginBottom: 16,
    },
    cabinetSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.card, 
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20, 
        borderWidth: 1,
        borderColor: COLORS.primary, 
    },
    cabinetSelectorText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.modalBackground, 
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.card,
    },
    modalTitle: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
    closeButtonText: { color: COLORS.primary, fontSize: 16 },
    searchInput: {
        height: 50,
        backgroundColor: COLORS.card,
        borderRadius: 8,
        margin: 16,
        paddingHorizontal: 16,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '50',
    },
    optionItem: { 
        paddingVertical: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.card 
    },
    optionText: { 
        color: COLORS.text, 
        fontSize: 16 
    },
    emptyListText: { 
        color: COLORS.textSecondary, 
        textAlign: 'center', 
        marginTop: 50, 
        fontSize: 16 
    },
    card: { 
        backgroundColor: COLORS.card, 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 16 
    },
    titleStatusRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    cardTitle: { 
        color: COLORS.text, 
        fontSize: 20, 
        fontWeight: 'bold' 
    },
    statusRow: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    statusIndicator: { 
        width: 6, 
        height: 6, 
        borderRadius: 3, 
        marginRight: 4 
    },
    statusText: { 
        fontSize: 14, 
        fontWeight: 'bold' 
    },
    mainValue: { 
        fontSize: 36, 
        fontWeight: 'bold', 
        marginBottom: 4 
    },
    targetLabel: { 
        color: COLORS.textSecondary, 
        fontSize: 14, 
        marginBottom: 20 
    },
    controlLabel: { 
        color: COLORS.text + 'CC', 
        fontSize: 16, 
        marginBottom: 5, 
        fontWeight: '600' 
    },
    slider: { 
        width: '100%', 
        height: 40 
    },
    // Стили для меток слайдера изменены: убран центр
    sliderLabels: { 
        width: '100%', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: -10,
        marginBottom: 20 
    },
    sliderLabel: { 
        color: COLORS.text + 'CC', 
        fontSize: 14 
    },
    toggleRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 10, 
        paddingTop: 10, 
        borderTopWidth: 1, 
        borderTopColor: COLORS.text + '10' 
    },
    toggleLabel: { 
        color: COLORS.text, 
        fontSize: 18, 
        fontWeight: '600' 
    },
    switchControl: { 
        transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] 
    },
    errorText: {
        color: COLORS.statusInactive,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary, 
        borderRadius: 10,
        paddingVertical: 12,
        marginBottom: 10,
        marginTop: 10, 
    },
    saveButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default SensorsScreen;