import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import Menu from './Component/Menu';
import Filter from './Component/Filter';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [panelImages, setPanelImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [filterModalVisible, setFilterModalVisible] = useState(false); // State để hiển thị modal lọc

    useEffect(() => {
        const unsubscribeHotels = firestore()
            .collection('hotels')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                let fetchedHotels = [];
                snapshot.forEach(doc => {
                    fetchedHotels.push({ id: doc.id, ...doc.data() });
                });
                setHotels(fetchedHotels);
                setLoading(false);
            }, error => {
                console.error('Error fetching hotels: ', error);
                setLoading(false);
            });

        const fetchPanelImages = async () => {
            try {
                const imagesSnapshot = await firestore().collection('homepage').get();
                const imagesData = imagesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPanelImages(imagesData);
            } catch (error) {
                console.error('Error fetching panel images: ', error);
            }
        };

        fetchPanelImages();

        return () => unsubscribeHotels(); // Cleanup listener on unmount
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (panelImages.length > 1) {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % panelImages.length);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [panelImages]);

    const handleSearch = () => {
        // Kiểm tra nếu searchQuery không rỗng thì mới điều hướng đến màn hình Search
        if (searchQuery.trim() !== '') {
            navigation.navigate('Search', { searchQuery });
        }
    };

    // Render function for each hotel item
    const renderHotelItem = (item) => (
        <TouchableOpacity style={styles.productContainer} onPress={() => navigation.navigate('Details', { hotelId: item.id })}>
            <Image source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }} style={styles.productImage} />
            <Text style={styles.productTitle}>{item.hotelName}</Text>
            <Text style={styles.productLocation}>{item.hotelLocation}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
        </TouchableOpacity>
    );

    // Function to extract hotels grouped by location
    const extractHotelGroups = () => {
        let groupedHotels = {};
        hotels.forEach(hotel => {
            const key = hotel.hotelLocation;
            if (!groupedHotels[key]) {
                groupedHotels[key] = [];
            }
            groupedHotels[key].push(hotel);
        });

        return groupedHotels;
    };

    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <Text style={styles.headingText}>Hotel Gay</Text>
                <Menu />
            </View>
            
            <View style={styles.searchContainer}>
                <AntDesign name='search1' size={20} color={'gray'} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Places to go, things to do, hotels..."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    onSubmitEditing={handleSearch} // Xử lý khi người dùng nhấn Enter
                />
            </View>

            <View style={styles.topImageContainer}>
                {panelImages.length > 0 && (
                    <Image
                        source={{ uri: panelImages[currentImageIndex].imageUrl }}
                        style={styles.topImage}
                    />
                )}
            </View>

            {panelImages.length > 1 && (
                <View style={styles.imageNavContainer}>
                    {panelImages.map((image, index) => (
                        <TouchableOpacity
                            key={image.id}
                            style={[
                                styles.imageNavButton,
                                index === currentImageIndex && styles.imageNavActive
                            ]}
                            onPress={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </View>
            )}
            <View style={styles.categoryContainer}>
                <Text style={styles.categoryText}>VietNam Hotel</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
                    <AntDesign name='filter' size={24} color={'black'} style={styles.filterIcon} />
                </TouchableOpacity>
            </View>

            <Filter 
                filterModalVisible={filterModalVisible}
                setFilterModalVisible={setFilterModalVisible}
                setHotels={setHotels}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                {Object.keys(extractHotelGroups()).map((location, index) => (
                    <View key={index} style={styles.locationContainer}>
                        <Text style={styles.locationHeader}>{location}</Text>
                        <ScrollView horizontal={true} contentContainerStyle={styles.hotelsScrollView}>
                            {extractHotelGroups()[location].map((hotel, hotelIndex) => (
                                <TouchableOpacity
                                    key={hotel.id}
                                    style={styles.productContainer}
                                    onPress={() => navigation.navigate('Details', { hotelId: hotel.id })}
                                >
                                    <Image source={{ uri: hotel.images && hotel.images.length > 0 ? hotel.images[0] : 'https://via.placeholder.com/150' }} style={styles.productImage} />
                                    <Text style={styles.productTitle}>{hotel.hotelName}</Text>
                                    <Text style={styles.productLocation}>{hotel.hotelLocation}</Text>
                                    <Text style={styles.productPrice}>{hotel.price}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10,
        marginTop: 10,
    },
    headingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color:'black',
    },
    filterIcon: {
        marginRight: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginHorizontal: 10,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginTop: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
    },
    topImageContainer: {
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    topImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    categoryContainer: {
        marginHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    categoryText: {
        fontWeight: 'bold',
        fontSize: 24,
        color:'black',
    },
    imageNavContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginTop:5,
    },
    imageNavButton: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'gray',
        marginHorizontal: 5,
    },
    imageNavActive: {
        backgroundColor: 'black',
    },
    scrollView: {
        flex: 1,
        marginTop: 10,
    },
    scrollViewContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    locationContainer: {
        marginBottom: 20,
    },
    locationHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color:'black',
    },
    hotelsScrollView: {
        flexDirection: 'row',
        paddingRight: 10, // Add right padding to avoid cut-off on scrolling
    },
    productContainer: {
        marginRight: 20,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        padding: 10,
    },
    productImage: {
        width: 320,
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    productTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    productLocation: {
        fontSize: 16,
        color: 'gray',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'green',
    },
});

export default HomeScreen;
