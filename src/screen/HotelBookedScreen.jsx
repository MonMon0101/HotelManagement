import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Menu from './Component/Menu';

const HotelBookedScreen = () => {
    const [loading, setLoading] = useState(true);
    const [groupedBookings, setGroupedBookings] = useState([]);

    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const handlerBack = () => {
        navigation.goBack();
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const snapshot = await firestore().collection('booked').orderBy('createdAt', 'desc').get();
                const bookingList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const bookingsWithDetails = await Promise.all(
                    bookingList.map(async booking => {
                        const hotelDoc = await firestore().collection('hotels').doc(booking.hotelId).get();
                        if (hotelDoc.exists) {
                            const hotelData = hotelDoc.data();
                            const userDoc = await firestore().collection('users').doc(booking.userId).get();
                            if (userDoc.exists) {
                                const userData = userDoc.data();
                                return {
                                    ...booking,
                                    hotelName: hotelData.hotelName,
                                    hotelAddress: hotelData.hotelLocation,
                                    userName: userData.username,
                                    phone: userData.phone,
                                    address: userData.location,
                                    email: userData.email,
                                };
                            } else {
                                console.warn(`User data not found for booking ID: ${booking.id}`);
                                return booking;
                            }
                        } else {
                            console.warn(`Hotel data not found for booking ID: ${booking.id}`);
                            return booking;
                        }
                    })
                );

                const grouped = groupBookings(bookingsWithDetails);
                setGroupedBookings(grouped);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const groupBookings = (bookings) => {
        const grouped = {};
        bookings.forEach(booking => {
            const key = `${booking.hotelId}_${booking.createdAt.toDate().toLocaleDateString('en-US')}`;
            if (!grouped[key]) {
                grouped[key] = {
                    hotelId: booking.hotelId,
                    createdAt: booking.createdAt.toDate().toLocaleDateString('en-US'),
                    bookings: []
                };
            }
            grouped[key].bookings.push(booking);
        });
        return Object.values(grouped);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handlerBack} style={styles.backButton}>
                    <AntDesign name="arrowleft" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booked Hotels</Text>
                <Menu/>
            </View>
            <ScrollView horizontal>
                {groupedBookings.map((group, index) => (
                    <View key={index} style={styles.groupContainer}>
                        <Text style={styles.dateSeparator}>Ngày đặt: {group.createdAt}</Text>
                        <FlatList
                            data={group.bookings}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.item}>
                                    <View style={styles.hotelInfo}>
                                        <Text style={styles.title}>Hotel Name: {item.hotelName}</Text>
                                        <Text>Address: {item.hotelAddress}</Text>
                                        <Text>Number of Guests: {item.numberOfGuests}</Text>
                                        <Text>Check-in Date: {item.checkIn}</Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.subtitle}>User Name: {item.userName}</Text>
                                        <Text>Phone: {item.phone}</Text>
                                        <Text>Email: {item.email}</Text>
                                    </View>
                                </View>
                            )}
                        />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        width: '100%',
        backgroundColor: '#007bff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    groupContainer: {
        width: 350,
        marginRight: 20,
        marginLeft: 20,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    hotelInfo: {
        flex: 1,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    dateSeparator: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
});

export default HotelBookedScreen;
