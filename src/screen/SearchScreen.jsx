import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const SearchScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { searchQuery } = route.params;
    const [hotels, setHotels] = useState([]);
    const [suggestedHotels, setSuggestedHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                const snapshot = await firestore()
                    .collection('hotels')
                    .where('hotelName', '>=', searchQuery.toLowerCase())
                    .where('hotelName', '<=', searchQuery.toLowerCase() + '\uf8ff')
                    .orderBy('hotelName')
                    .get();

                if (snapshot.empty) {
                    console.log('No matching documents.');
                    setHotels([]);
                } else {
                    let fetchedHotels = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    console.log('Fetched hotels:', fetchedHotels); // Kiểm tra dữ liệu bạn nhận được
                    setHotels(fetchedHotels);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching hotels: ', error);
                setLoading(false);
            }
        };

        if (searchQuery) {
            fetchHotels();
        } else {
            setHotels([]);
            setLoading(false);
        }
    }, [searchQuery]);

    // Xử lý khi nhập vào TextInput
    const handleTextInputChange = async (text) => {
        try {
            const snapshot = await firestore()
                .collection('hotels')
                .where('hotelName', '>=', text.toLowerCase())
                .where('hotelName', '<=', text.toLowerCase() + '\uf8ff')
                .orderBy('hotelName')
                .get();

            if (snapshot.empty) {
                console.log('No matching documents.');
                setSuggestedHotels([]);
            } else {
                let fetchedHotels = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('Fetched suggested hotels:', fetchedHotels); // Kiểm tra dữ liệu bạn nhận được
                setSuggestedHotels(fetchedHotels);
            }
        } catch (error) {
            console.error('Error fetching suggested hotels: ', error);
        }
    };

    const handlerDetails = (item) => {
        navigation.navigate('Details', { hotelId: item.id });
    };

    const renderHotelItem = ({ item }) => (
        <TouchableOpacity style={styles.productContainer} onPress={() => handlerDetails(item)}>
            <Image source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }} style={styles.productImage} />
            <Text style={styles.productTitle}>{item.hotelName}</Text>
            <Text style={styles.productLocation}>{item.hotelLocation}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
        </TouchableOpacity>
    );

    const renderSuggestedItem = ({ item }) => (
        <TouchableOpacity style={styles.suggestedItemContainer} onPress={() => handlerDetails(item)}>
            <Text style={styles.suggestedItemText}>{item.hotelName}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Search hotels..."
                    onChangeText={handleTextInputChange}
                    value={searchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            ) : hotels.length === 0 ? (
                <View style={styles.noResultContainer}>
                    {suggestedHotels.length > 0 ? (
                        <FlatList
                            data={suggestedHotels}
                            renderItem={renderSuggestedItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.suggestedListContainer}
                        />
                    ) : (
                        <Text style={styles.noResultText}>No results found.</Text>
                    )}
                </View>
            ) : (
                <FlatList
                    data={hotels}
                    renderItem={renderHotelItem}
                    keyExtractor={(item) => item.id}
                    numColumns={1}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    backButton: {
        fontSize: 16,
        color: '#007bff',
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        marginLeft: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noResultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noResultText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray',
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    productContainer: {
        flex: 1,
        margin: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    productTitle: {
        padding: 10,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black',
    },
    productLocation: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
        marginTop: 5,
        textAlign: 'center',
    },
    suggestedListContainer: {
        marginTop: 10,
        flexGrow: 1,
    },
    suggestedItemContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    suggestedItemText: {
        fontSize: 16,
        color: 'black',
    },
});

export default SearchScreen;
