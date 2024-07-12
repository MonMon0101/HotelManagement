import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Menu from './Component/Menu';

const HomeAdminScreen = ({ navigation }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const hotelsSnapshot = await firestore()
            .collection('hotels')
            .where('userId', '==', user.uid)
            .get();

          const hotelsList = hotelsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setHotels(hotelsList);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotels: ', error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handlerAddHotel = () => {
    navigation.navigate('AddHotel');
  };

  const handleEditHotel = (hotelId) => {
    navigation.navigate('EditHotel', { hotelId });
  };

  const handleDeleteHotel = async (hotelId) => {
    try {
      await firestore().collection('hotels').doc(hotelId).delete();
      // Remove the deleted hotel from the state
      setHotels(prevHotels => prevHotels.filter(hotel => hotel.id !== hotelId));
    } catch (error) {
      console.error('Error deleting hotel: ', error);
    }
  };

  const handleBookedRooms = () => {
    navigation.navigate('Booked');
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.hotelName}>{item.hotelName}</Text>
          <Text style={styles.hotelLocation}>{item.hotelLocation}</Text>
          <Text style={styles.hotelPrice}>{item.price}</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditHotel(item.id)}>
            <AntDesign name="edit" size={20} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteHotel(item.id)}>
            <AntDesign name="delete" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách khách sạn</Text>
        <Menu />
      </View>
      <FlatList
        data={hotels}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.bookedButton} onPress={handleBookedRooms}>
        <Text style={styles.bookedButtonText}>Phòng đã đặt</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={handlerAddHotel}>
        <Text style={styles.addButtonText}>Thêm khách sạn</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeAdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#007bff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
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
    color: 'green',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  bookedButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#fa5130',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  bookedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 100, // Increase paddingBottom if necessary to avoid overlap with the "Phòng đã đặt" button
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
