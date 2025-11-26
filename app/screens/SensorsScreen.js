import React, { useState } from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import Slider from '@react-native-community/slider';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

const CABINETS = [
  'Кабинет 101', 'Кабинет 102', 'Кабинет 103', 'Кабинет 104',
  'Кабинет 201', 'Кабинет 202', 'Кабинет 203', 'Кабинет 204',
  'Датчик 303 (Серверная)', 'Датчик 304 (Склад А)', 'Датчик 404 (Склад Б)',
];

// ----------------------------------------------------------------
// --- Компоненты SearchableDropdown и SensorConfigCard без изменений ---
// ----------------------------------------------------------------
const SearchableDropdown = ({ selectedOption, onSelect, options }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
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
      <Text style={styles.optionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity 
        style={styles.cabinetSelectorContainer} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.cabinetSelectorText}>{selectedOption}</Text>
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
            <Text style={styles.modalTitle}>Выберите Кабинет</Text>
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
            keyExtractor={(item) => item}
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

const SensorConfigCard = ({ title, targetLabel, initialSliderValue, unit }) => {
  const [sliderValue, setSliderValue] = useState(initialSliderValue); 
  const [isEnabled, setIsEnabled] = useState(true);

  const handleValueChange = (value) => setSliderValue(value); 
  const toggleSwitch = () => setIsEnabled(prev => !prev);

  const statusColor = isEnabled ? COLORS.statusActive : COLORS.statusInactive;
  const statusText = isEnabled ? 'Включено' : 'Выключено';
  const displayValueColor = isEnabled ? COLORS.text : COLORS.textSecondary;
  const formattedMainValue = `${sliderValue.toFixed(1)}${unit}`;
  const formattedSliderLabel = `${Math.round(sliderValue)}${unit}`;

  return (
    <View style={styles.card}>
      <View style={styles.titleStatusRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>
      <Text style={[styles.mainValue, {color: displayValueColor}]}>{formattedMainValue}</Text>
      <Text style={styles.targetLabel}>{targetLabel}</Text>
      <Text style={styles.controlLabel}>Регулировка:</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        value={sliderValue} 
        onValueChange={handleValueChange} 
        minimumTrackTintColor={COLORS.primary}
        maximumTrackTintColor={COLORS.text + '50'}
        thumbTintColor={COLORS.primary}
        step={0.5} 
        disabled={!isEnabled}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{formattedSliderLabel}</Text> 
        <Text style={styles.sliderLabel}>{unit}</Text>
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Питание</Text>
        <Switch
            trackColor={{ false: COLORS.text + '30', true: COLORS.primary + '50' }}
            thumbColor={isEnabled ? COLORS.primary : COLORS.textSecondary}
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switchControl}
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
  const [selectedCabinet, setSelectedCabinet] = useState(CABINETS[0]); 

  return (
    <View style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={{
          paddingTop: insets.top, // SafeArea сверху
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Датчики</Text>

        <SearchableDropdown 
          selectedOption={selectedCabinet}
          onSelect={setSelectedCabinet}
          options={CABINETS}
        />

        <SensorConfigCard
          title={`Температура`} 
          targetLabel="Среднее значение 30°C"
          initialSliderValue={50} 
          unit="°C"
        />

        <SensorConfigCard
          title={`Влажность`} 
          targetLabel="Среднее значение 50%"
          initialSliderValue={70} 
          unit="%"
        />

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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16, // только небольшой отступ вниз
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
    fontWeight: '600' },
  switchControl: { 
    transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] 
  },
});

export default SensorsScreen;
