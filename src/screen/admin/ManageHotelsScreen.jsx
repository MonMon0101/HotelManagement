import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure to install react-native-vector-icons

const ManageHotelsScreen = ({ navigation }) => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const hotelsSnapshot = await firestore().collection('hotels').get();
        const hotelsData = hotelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHotels(hotelsData);
      } catch (error) {
        console.error('Error fetching hotels: ', error);
      }
    };

    fetchHotels();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userSnapshot = await firestore().collection('users').doc(userId).get();
      if (userSnapshot.exists) {
        return userSnapshot.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data: ', error);
      return null;
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    try {
      await firestore().collection('hotels').doc(hotelId).delete();
      // Remove deleted hotel from state or fetch again from Firestore
      setHotels(prevHotels => prevHotels.filter(hotel => hotel.id !== hotelId));
      console.log('Hotel deleted successfully');
    } catch (error) {
      console.error('Error deleting hotel: ', error);
    }
  };

  const renderItem = async ({ item }) => {
    const userData = await fetchUserData(item.userId);

    return (
      <View style={styles.hotelItem}>
        <Image source={{ uri: item.images[0] }} style={styles.hotelImage} />
        <View style={styles.hotelDetails}>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
          <Text style={styles.hotelLocation}>{item.hotelLocation}</Text>
          <Text style={styles.hotelPrice}>{item.price}</Text>
          <Text style={styles.hotelCreatedAt}>Posted: {item.createdAt.toDate().toLocaleString()}</Text>
          {userData && (
            <View>
              <Text style={styles.userDetails}>Posted by: {userData.username}</Text>
              <Text style={styles.userDetails}>Email: {userData.email}</Text>
              {/* Add more user details as needed */}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => handleDeleteHotel(item.id)} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Manage Hotels</Text>
      </View>
      <FlatList
        data={hotels}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.hotelList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  hotelList: {
    flex: 1,
  },
  hotelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  hotelImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  hotelDetails: {
    marginLeft: 10,
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hotelLocation: {
    fontSize: 16,
    color: 'gray',
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  hotelCreatedAt: {
    fontSize: 14,
    color: 'blue',
  },
  userDetails: {
    fontSize: 14,
    color: 'green',
  },
  deleteButton: {
    padding: 10,
  },
});

export default ManageHotelsScreen;
