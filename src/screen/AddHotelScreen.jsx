import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Menu from './Component/Menu';

const AddHotelScreen = () => {
    const [hotelName, setHotelName] = useState('');
    const [hotelLocation, setHotelLocation] = useState('');
    const [hotelNote, setHotelNote] = useState('');
    const [images, setImages] = useState([]);
    const [price, setPrice] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const handleChooseImage = () => {
        launchImageLibrary({ mediaType: 'photo', multiple: true }, (response) => {
            if (response.assets && response.assets.length > 0) {
                const newImages = response.assets.map(asset => ({ uri: asset.uri }));
                setImages(newImages);
            } else if (response.errorCode) {
                console.error('ImagePicker Error: ', response.errorCode, response.errorMessage);
                Alert.alert('Error', 'Failed to pick images. Please try again.');
            }
        });
    };

    const uploadImages = async (images) => {
        const user = auth().currentUser;
        if (user) {
            const urls = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const filename = image.uri.substring(image.uri.lastIndexOf('/') + 1);
                const uploadUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
                const storageRef = storage().ref(`Images/${user.uid}/${filename}`);
                const task = storageRef.putFile(uploadUri);

                try {
                    await task;
                    const url = await storageRef.getDownloadURL();
                    urls.push(url);
                } catch (e) {
                    console.error(e);
                    Alert.alert('Upload failed', 'Sorry, we were unable to upload one of your images.');
                    return null;
                }
            }
            return urls;
        }
    };

    const handleSaveHotel = async () => {
        if (!hotelName.trim() || !hotelLocation.trim() || !hotelNote.trim() || images.length === 0 || !price) {
            Alert.alert('Error', 'Please fill in all fields, choose images, and enter a price.');
            return;
        }

        setLoading(true);
        const user = auth().currentUser;
        if (user) {
            try {
                const imageUrls = await uploadImages(images);
                if (!imageUrls) return;

                const hotelRef = await firestore().collection('hotels').add({
                    hotelName: hotelName,
                    hotelLocation: hotelLocation,
                    hotelNote: hotelNote,
                    images: imageUrls,
                    price: `${price} VND`,
                    numberOfPeople: numberOfPeople,
                    userId: user.uid,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });

                setLoading(false);
                Alert.alert('Success', 'Hotel saved successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } catch (error) {
                console.error(error);
                setLoading(false);
                Alert.alert('Error', 'Failed to save hotel. Please try again later.');
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="back" size={30} color="black" />
                </TouchableOpacity>
                <Menu/>
            </View>

            <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>
                    <Text style={styles.imagePickerText}>Choose Images</Text>
                </TouchableOpacity>
                <View style={styles.previewImagesContainer}>
                    {images.map((image, index) => (
                        <Image key={index} source={{ uri: image.uri }} style={styles.previewImage} />
                    ))}
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Name:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter hotel name"
                    value={hotelName}
                    onChangeText={setHotelName}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Location:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter hotel location"
                    value={hotelLocation}
                    onChangeText={setHotelLocation}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Note:</Text>
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    placeholder="Enter notes about the hotel"
                    multiline
                    numberOfLines={4}
                    value={hotelNote}
                    onChangeText={setHotelNote}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Price:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter price"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Number of People:</Text>
                <View style={styles.numberOfPeopleButtons}>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={[styles.numberOfPeopleButton, num === numberOfPeople && styles.selectedNumberOfPeopleButton]}
                            onPress={() => setNumberOfPeople(num)}>
                            <Text style={styles.numberOfPeopleButtonText}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSaveHotel} disabled={loading}>
                <Text style={styles.buttonText}>Save Hotel</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: 'white',
        paddingVertical: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 40,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    imagePicker: {
        width: '80%',
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    imagePickerText: {
        color: 'white',
        fontSize: 18,
    },
    previewImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    previewImage: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 10,
    },
    inputContainer: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    numberOfPeopleButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    numberOfPeopleButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    selectedNumberOfPeopleButton: {
        backgroundColor: '#0056b3',
    },
    numberOfPeopleButtonText: {
        color: 'white',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AddHotelScreen;
