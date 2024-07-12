import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function DetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { hotelId } = route.params;
  const [hotelDetails, setHotelDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const hotelDoc = await firestore().collection('hotels').doc(hotelId).get();
        if (hotelDoc.exists) {
          const data = hotelDoc.data();
          setHotelDetails({
            ...data,
            images: data.images || [] // Ensure images array exists
          });
          if (data.images && data.images.length === 1) {
            // Automatically set current index to 0 if only one image
            setCurrentImageIndex(0);
          }
        } else {
          console.error('Hotel document does not exist');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotel details: ', error);
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  useEffect(() => {
    // Automatically change image every 3 seconds if there are more than one image
    if (hotelDetails && hotelDetails.images && hotelDetails.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === hotelDetails.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [hotelDetails]);

  const handlerBack = () => {
    navigation.goBack();
  };

  const handlerShare = () => {
    ToastAndroid.show('Đã chia sẻ sản phẩm', ToastAndroid.SHORT);
  };

  const handlerFavourite = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        await firestore()
          .collection('favourites')
          .add({
            userId: user.uid,
            hotelId: hotelId,
            hotelName: hotelDetails.hotelName,
            hotelLocation: hotelDetails.hotelLocation,
            price: hotelDetails.price,
            imageUrl: hotelDetails.images && hotelDetails.images.length > 0 ? hotelDetails.images[0] : 'https://via.placeholder.com/150', // Use first image or default URL
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        ToastAndroid.show('Đã thêm vào danh sách yêu thích', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Bạn cần đăng nhập để thêm vào danh sách yêu thích', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error adding to favourites: ', error);
      ToastAndroid.show('Đã xảy ra lỗi, vui lòng thử lại', ToastAndroid.SHORT);
    }
  };

  const handleComment = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        // Check if there is already a comment for this hotel by the current user
        const querySnapshot = await firestore()
          .collection('comments')
          .where('userId', '==', user.uid)
          .where('hotelId', '==', hotelId)
          .get();
        
        if (querySnapshot.size > 0) {
          // Comment already exists, navigate to CommentSection directly
          navigation.navigate('Comment', { hotelId: hotelId });
        } else {
          // No existing comment, add new comment
          await firestore().collection('comments').add({
            userId: user.uid,
            hotelId: hotelId,
            content: '', // Add content of the comment here
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
          navigation.navigate('Comment', { hotelId: hotelId }); // Navigate to Comment screen after adding comment
        }
      } else {
        ToastAndroid.show('Bạn cần đăng nhập để bình luận', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error adding comment: ', error);
      ToastAndroid.show('Đã xảy ra lỗi khi thêm bình luận, vui lòng thử lại', ToastAndroid.SHORT);
    }
  };

  const handleImagePress = (index) => {
    setCurrentImageIndex(index);
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
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlerShare}>
          <AntDesign name="sharealt" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: hotelDetails.images && hotelDetails.images[currentImageIndex] }}
          style={styles.image}
        />
        {hotelDetails.images.length > 1 && (
          <View style={styles.imageControls}>
            {hotelDetails.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageControl,
                  index === currentImageIndex && styles.activeImageControl,
                ]}
                onPress={() => handleImagePress(index)}
              />
            ))}
          </View>
        )}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{hotelDetails.hotelName}</Text>
        <Text style={styles.location}>Address: {hotelDetails.hotelLocation}</Text>
        <Text style={styles.price}>Price: {hotelDetails.price}</Text>
        <Text style={styles.note}>Note: {hotelDetails.hotelNote}</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleComment}>
          <Text style={styles.buttonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlerFavourite}>
          <Text style={styles.buttonText}>Favourite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor:'blue',
    paddingBottom:15,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '99%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  imageControls: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imageControl: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginHorizontal: 5,
  },
  activeImageControl: {
    backgroundColor: '#007bff',
  },
  detailsContainer: {
    marginTop: 10,
    flex:1,
    paddingHorizontal: 10, // Thêm khoảng cách ngang giữa nội dung và biên
    paddingVertical: 5, // Thêm khoảng cách dọc giữa nội dung và biên
    borderTopWidth: 6, // Độ dày của border phía trên
    borderBottomWidth: 0, // Độ dày của border phía dưới
    borderLeftWidth: 4, // Độ dày của border bên trái
    borderRightWidth: 4, // Độ dày của border bên phải
    borderRadius: 10,
    backgroundColor: '#f0f0f0', // Màu nền
    borderColor: '#ccc', // Màu của border

  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'black',
  },
  location: {
    fontSize: 18,
    marginTop: 5,
  },
  price: {
    fontSize: 18,
    marginTop: 5,
    color:'black',
    fontWeight:'bold',

  },
  note: {
    fontSize: 18,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0', // Background color
    borderWidth: 5,
    borderColor: '#ccc', // Border color
    color:'black',

  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    borderTopWidth:2,
    borderRadius:10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop:10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
