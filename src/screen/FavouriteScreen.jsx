import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { CheckBox } from 'react-native-elements';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Menu from './Component/Menu';

const FavouriteScreen = ({ navigation }) => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [isAnyItemSelected, setIsAnyItemSelected] = useState(false);
  const listener = useRef(null); // Ref for storing the listener

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      // Create a listener for real-time updates on favourites
      const unsubscribe = firestore()
        .collection('favourites')
        .where('userId', '==', user.uid)
        .onSnapshot(querySnapshot => {
          const favouritesList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            imageUrl: doc.data().imageUrl || 'https://via.placeholder.com/150', // Ensure imageUrl is defined
          }));
          setFavourites(favouritesList);
          setLoading(false);
        });

      // Store the unsubscribe function in the ref
      listener.current = unsubscribe;
    } else {
      setLoading(false);
    }

    return () => {
      // Unsubscribe from the listener when component unmounts
      if (listener.current) {
        listener.current();
      }
    };
  }, []);

  useEffect(() => {
    calculateTotalCost();
    setIsAnyItemSelected(Object.keys(checkedItems).some(key => checkedItems[key]));
  }, [checkedItems]);

  const calculateTotalCost = () => {
    let total = 0;
    favourites.forEach(fav => {
      if (checkedItems[fav.id]) {
        total += parseInt(fav.price);
      }
    });
    setTotalCost(total);
  };

  const handlerBack = () => {
    navigation.goBack();
  };

  const handlerDelete = async (id) => {
    try {
      await firestore().collection('favourites').doc(id).delete();
      setFavourites(favourites.filter(fav => fav.id !== id));
      
      // Update checkedItems to remove the deleted item if it was checked
      const newCheckedItems = { ...checkedItems };
      delete newCheckedItems[id];
      setCheckedItems(newCheckedItems);
      
      ToastAndroid.show('Đã xóa khỏi danh sách yêu thích', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error deleting favourite: ', error);
      ToastAndroid.show('Đã xảy ra lỗi, vui lòng thử lại', ToastAndroid.SHORT);
    }
  };

  const handleBooking = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const selectedItems = favourites.filter(fav => checkedItems[fav.id]);
        if (selectedItems.length === 0) {
          ToastAndroid.show('Vui lòng chọn ít nhất một khách sạn để đặt hàng', ToastAndroid.SHORT);
          return;
        }
  
        await Promise.all(selectedItems.map(async (item) => {
          await firestore().collection('bookings').add({
            userId: user.uid,
            hotelId: item.hotelId,
            hotelName: item.hotelName,
            hotelLocation: item.hotelLocation,
            price: item.price,
            imageUrl: item.imageUrl || 'https://via.placeholder.com/150',
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
          await firestore().collection('favourites').doc(item.id).delete();
        }));
  
        ToastAndroid.show('Đặt phòng thành công!', ToastAndroid.SHORT);
        navigation.navigate('Booking'); // Navigate to BookingScreen after booking
      } else {
        ToastAndroid.show('Bạn cần đăng nhập để đặt hàng', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error booking items: ', error);
      ToastAndroid.show('Đã xảy ra lỗi, vui lòng thử lại', ToastAndroid.SHORT);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlerBack}>
          <FontAwesome name="arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourite</Text>
        <Menu/>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {favourites.map(fav => (
          <View key={fav.id} style={styles.cardContainer}>
            <View style={styles.itemRow}>
              <CheckBox
                checked={checkedItems[fav.id] || false}
                onPress={() => {
                  const newCheckedItems = { ...checkedItems, [fav.id]: !checkedItems[fav.id] };
                  setCheckedItems(newCheckedItems);
                }}
              />
              <Text style={styles.itemText}>{fav.hotelName}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handlerDelete(fav.id)}>
                <FontAwesome name="trash-o" size={25} color="black" />
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.itemRow}>
              <Image source={{ uri: fav.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemText}>Address: {fav.hotelLocation}</Text>
                <Text style={styles.itemText}>Prices: {fav.price}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.costText}></Text>
        <TouchableOpacity
          style={[styles.bookingButton, !isAnyItemSelected && styles.disabledBookingButton]}
          onPress={handleBooking}
          disabled={!isAnyItemSelected}
        >
          <Text style={styles.bookingButtonText}>Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#007bff',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  cardContainer: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    
  },
  itemText: {
    fontSize: 18,
    color: 'black',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: 'black',
    marginLeft: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  costText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  bookingButton: {
    backgroundColor: '#fa5130',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBookingButton: {
    backgroundColor: '#ccc',
  },
  bookingButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavouriteScreen;
