import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { launchImageLibrary } from 'react-native-image-picker';

const EditHotelScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hotelId } = route.params;

  const [hotelDetails, setHotelDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const hotelDoc = await firestore().collection('hotels').doc(hotelId).get();
        if (hotelDoc.exists) {
          const data = hotelDoc.data();
          setHotelDetails(data);
          setImages(data.images || [data.avatarUrl]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotel details: ', error);
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  const handleImagePick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0, maxWidth: 800, maxHeight: 800, quality: 1 });
    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorMessage) {
      console.error('ImagePicker Error: ', result.errorMessage);
    } else {
      const selectedImages = result.assets.map(asset => asset.uri);
      await uploadImages(selectedImages);
    }
  };

  const uploadImages = async (uris) => {
    const uploadedImages = [];
    setSaving(true);

    for (const uri of uris) {
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri = uri.replace('file://', '');
      const task = storage().ref(filename).putFile(uploadUri);

      try {
        await task;
        const url = await storage().ref(filename).getDownloadURL();
        uploadedImages.push(url);
      } catch (e) {
        console.error(e);
      }
    }

    setImages([...images, ...uploadedImages]);
    setSaving(false);
  };

  const deleteImage = (url) => {
    setImages(images.filter(image => image !== url));
  };

  const handleSave = async () => {
    if (!hotelDetails.hotelName || !hotelDetails.hotelLocation || !hotelDetails.price || !hotelDetails.numberOfPeople) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      await firestore().collection('hotels').doc(hotelId).update({ ...hotelDetails, images });
      Alert.alert('Success', 'Hotel details updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating hotel details: ', error);
      Alert.alert('Error', 'Failed to update hotel details');
      setSaving(false);
    }
  };

  const handlerBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlerBack}>
            <AntDesign name="back" size={30} color={"white"} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Edit Hotel</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Hotel Name</Text>
          <TextInput
            style={styles.input}
            value={hotelDetails.hotelName}
            onChangeText={(text) => setHotelDetails({ ...hotelDetails, hotelName: text })}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={hotelDetails.hotelLocation}
            onChangeText={(text) => setHotelDetails({ ...hotelDetails, hotelLocation: text })}
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={hotelDetails.price}
            onChangeText={(text) => setHotelDetails({ ...hotelDetails, price: text })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Number of People</Text>
          <TextInput
            style={styles.input}
            value={hotelDetails.numberOfPeople.toString()}
            onChangeText={(text) => setHotelDetails({ ...hotelDetails, numberOfPeople: parseInt(text) })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.largeInput]} // Applied largeInput style for larger input area
            value={hotelDetails.hotelNote}
            onChangeText={(text) => setHotelDetails({ ...hotelDetails, hotelNote: text })}
            multiline={true}
            numberOfLines={4}
          />

          <Text style={styles.label}>Images</Text>
          <TouchableOpacity onPress={handleImagePick} style={styles.imagePicker}>
            <Text style={styles.imagePickerText}>Add Images</Text>
          </TouchableOpacity>

          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item }} style={styles.image} />
                <TouchableOpacity onPress={() => deleteImage(item)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            horizontal
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditHotelScreen;

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#007bff',
  },
  headerTitle: {
    marginLeft: 10,
    
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    
  },
  formContainer: {
    padding: 20,
    
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: 'black',
  },
  largeInput: {
    height: 100, // Increased height for larger input area
    textAlignVertical: 'top', // Align text to the top
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  imageContainer: {
    marginVertical: 10,
    alignItems: 'center',
    marginRight: 10,
    
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    
  },
  imagePicker: {
    backgroundColor: '#ddd',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    
  },
  imagePickerText: {
    color: 'black',
    fontWeight: 'bold',
    
  },
});
