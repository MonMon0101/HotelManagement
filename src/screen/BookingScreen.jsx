import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ToastAndroid } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Calendar } from 'react-native-calendars';

const BookingScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [guestsInput, setGuestsInput] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1); // Default to 1 guest
  const [showCalendar, setShowCalendar] = useState(false); // State to control calendar visibility

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const bookingsSnapshot = await firestore()
            .collection('bookings')
            .where('userId', '==', user.uid)
            .get();

          const bookingsList = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setBookings(bookingsList);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings: ', error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        // Xóa dữ liệu từ bookings
        await Promise.all(bookings.map(async (booking) => {
          await firestore().collection('bookings').doc(booking.id).delete();
        }));
  
        // Lưu vào favourites
        await Promise.all(bookings.map(async (booking) => {
          await firestore().collection('favourites').add({
            userId: user.uid,
            hotelName: booking.hotelName,
            hotelLocation: booking.hotelLocation,
            price: booking.price,
            imageUrl: booking.imageUrl,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        }));
  
        // Xóa thành công, cập nhật lại state
        setBookings([]);
        ToastAndroid.show('Đã hủy tất cả đặt phòng và lưu vào Favorites', ToastAndroid.SHORT);
        navigation.goBack();
      } else {
        ToastAndroid.show('Bạn cần đăng nhập để hủy đặt phòng', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error cancelling bookings: ', error);
      ToastAndroid.show('Đã xảy ra lỗi, vui lòng thử lại', ToastAndroid.SHORT);
    }
  };
  
  const handleBooking = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        // Thêm dữ liệu đặt phòng vào collection 'booked'
        await Promise.all(bookings.map(async (booking) => {
          await firestore().collection('booked').add({
            userId: user.uid,
            hotelId: booking.hotelId, // Thêm hotelId vào dữ liệu đặt phòng
            hotelName: booking.hotelName,
            hotelLocation: booking.hotelLocation,
            checkInDate: checkInDate,
            numberOfGuests: numberOfGuests,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        }));
    
        // Xóa dữ liệu đặt phòng khỏi collection 'bookings'
        await Promise.all(bookings.map(async (booking) => {
          await firestore().collection('bookings').doc(booking.id).delete();
        }));
    
        ToastAndroid.show('Đặt phòng thành công và đã xóa khỏi Bookings', ToastAndroid.SHORT);
        navigation.goBack();
      } else {
        ToastAndroid.show('Bạn cần đăng nhập để đặt phòng', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error booking: ', error);
      ToastAndroid.show('Đã xảy ra lỗi, vui lòng thử lại', ToastAndroid.SHORT);
    }
  };
  
  
  

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleGuestsInput = (text) => {
    setGuestsInput(text);
    // Parse the input to ensure it's a valid number if needed
    const parsedNumber = parseInt(text, 10);
    if (!isNaN(parsedNumber)) {
      setNumberOfGuests(parsedNumber);
    }
  };

  const onDayPress = (day) => {
    // Update selected date and close calendar
    setCheckInDate(new Date(day.timestamp));
    setShowCalendar(false);
  };

  const renderCalendarIcon = () => {
    return (
      <TouchableOpacity onPress={() => setShowCalendar(true)}>
        <Image source={require('./assets/calendar_icon.png')} style={styles.calendarIcon} />
      </TouchableOpacity>
    );
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await firestore().collection('bookings').doc(bookingId).delete();
      ToastAndroid.show('Đã xóa đặt phòng thành công', ToastAndroid.SHORT);
      
      // Cập nhật lại state bookings sau khi xóa
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Error deleting booking: ', error);
      ToastAndroid.show('Đã xảy ra lỗi, vui lòng thử lại', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Details</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.image} />
            <Text style={styles.bookingText}>Name: {item.hotelName}</Text>
            <Text style={styles.bookingText}>Address: {item.hotelLocation}</Text>
            <Text style={styles.bookingText}>Price: {item.price}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Ngày CheckIn</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={styles.dateInput}
                  placeholder="Chọn ngày CheckIn"
                  editable={false}
                  value={formatDate(checkInDate)}
                />
                {renderCalendarIcon()}
              </View>
            </View>
            <Text style={styles.label}>Số lượng người</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số lượng người"
              keyboardType="numeric"
              value={guestsInput}
              onChangeText={handleGuestsInput}
            />
            {showCalendar && (
              <Calendar
                current={checkInDate.toISOString().split('T')[0]}
                onDayPress={(day) => onDayPress(day)}
                hideExtraDays={true}
                disableMonthChange={true}
                markedDates={{
                  [checkInDate.toISOString().split('T')[0]]: { selected: true, marked: true, selectedColor: 'blue' },
                }}
                minDate={new Date()} // Ngày tối thiểu là ngày hiện tại
                maxDate={new Date(new Date().getFullYear() + 1, 11, 31)} // Ngày tối đa là 1 năm sau từ ngày hiện tại
              />
            )}
            <TouchableOpacity onPress={() => handleDeleteBooking(item.id)}>
              <Image source={require('./assets/delete_icon.png')} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#fa5130' }]} onPress={handleCancelBooking}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#007bff' }]} onPress={handleBooking}>
          <Text style={styles.buttonText}>Booking</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  bookingItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  bookingText: {
    fontSize: 18,
    color: 'black',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  calendarIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: 'red',
    marginTop: 5,
  },
});

export default BookingScreen;
