// Filter.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Filter = ({ filterModalVisible, setFilterModalVisible, setHotels }) => {
    const [filterType, setFilterType] = useState(''); // State để lưu loại lọc: 'price' hoặc 'location'
    const [minPrice, setMinPrice] = useState(''); // State để lưu giá tối thiểu
    const [maxPrice, setMaxPrice] = useState(''); // State để lưu giá tối đa
    const [locationQuery, setLocationQuery] = useState(''); // State để lưu địa chỉ

    const handleFilter = () => {
        // Kiểm tra xem loại lọc là gì và thực hiện lọc tương ứng
        firestore()
            .collection('hotels')
            .orderBy('createdAt', 'desc')
            .get()
            .then(snapshot => {
                let fetchedHotels = [];
                snapshot.forEach(doc => {
                    fetchedHotels.push({ id: doc.id, ...doc.data() });
                });

                let filteredHotels = fetchedHotels;
                if (filterType === 'price') {
                    filteredHotels = fetchedHotels.filter(hotel => {
                        if (minPrice && maxPrice) {
                            return parseInt(hotel.price) >= parseInt(minPrice) && parseInt(hotel.price) <= parseInt(maxPrice);
                        }
                        return true;
                    });
                } else if (filterType === 'location') {
                    filteredHotels = fetchedHotels.filter(hotel => {
                        if (locationQuery) {
                            return hotel.hotelLocation.toLowerCase().includes(locationQuery.toLowerCase());
                        }
                        return true;
                    });
                }
                setHotels(filteredHotels);
                setFilterModalVisible(false); // Ẩn modal lọc sau khi áp dụng lọc
            })
            .catch(error => {
                console.error('Error fetching hotels: ', error);
            });
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setLocationQuery('');
        // Reset the hotels list to original
        firestore()
            .collection('hotels')
            .orderBy('createdAt', 'desc')
            .get()
            .then(snapshot => {
                let fetchedHotels = [];
                snapshot.forEach(doc => {
                    fetchedHotels.push({ id: doc.id, ...doc.data() });
                });
                setHotels(fetchedHotels);
            })
            .catch(error => {
                console.error('Error fetching hotels: ', error);
            });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={filterModalVisible}
            onRequestClose={() => {
                setFilterModalVisible(false);
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>Filter by:</Text>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setFilterType('price')}>
                        <Text style={styles.filterButtonText}>Price Range</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton} onPress={() => setFilterType('location')}>
                        <Text style={styles.filterButtonText}>Location</Text>
                    </TouchableOpacity>

                    {filterType === 'price' && (
                        <View style={styles.filterSection}>
                            <TextInput
                                placeholder="From"
                                style={styles.input}
                                keyboardType="numeric"
                                value={minPrice}
                                onChangeText={(text) => setMinPrice(text)}
                            />
                            <TextInput
                                placeholder="To"
                                style={styles.input}
                                keyboardType="numeric"
                                value={maxPrice}
                                onChangeText={(text) => setMaxPrice(text)}
                            />
                        </View>
                    )}
                    {filterType === 'location' && (
                        <View style={styles.filterSection}>
                            <TextInput
                                placeholder="Enter location"
                                style={[styles.input, styles.locationInput]}
                                value={locationQuery}
                                onChangeText={(text) => setLocationQuery(text)}
                            />
                        </View>
                    )}
                    <Pressable
                        style={[styles.filterButton, styles.applyButton]}
                        onPress={handleFilter}
                    >
                        <Text style={styles.applyButtonText}>Apply Filter</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterButton, styles.clearButtonModal]}
                        onPress={clearFilters}
                    >
                        <Text style={styles.clearButtonText}>Clear Filters</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.filterButton, styles.cancelButton]}
                        onPress={() => setFilterModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    filterButton: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    filterSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    locationInput: {
        marginTop: 10,
    },
    applyButton: {
        backgroundColor: '#2196F3',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    clearButtonModal: {
        backgroundColor: '#FF6347',
    },
    clearButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: 'gray',
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Filter;
