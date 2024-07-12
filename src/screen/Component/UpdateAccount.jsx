import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Menu from './Menu';


export default function UpdateAccountScreen({ navigation }) {
  const [frontId, setFrontId] = useState(null);
  const [backId, setBackId] = useState(null);
  const [businessCertificate, setBusinessCertificate] = useState(null);
  const [fullname, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const uploadImage = async (image, path) => {
    const reference = storage().ref(path);
    await reference.putFile(image.uri);
    const url = await reference.getDownloadURL();
    return url;
  };

  const handleSubmit = async () => {
    const user = auth().currentUser;
    if (user) {
      try {
        const frontIdUrl = await uploadImage(frontId, `users/${user.uid}/frontId.jpg`);
        const backIdUrl = await uploadImage(backId, `users/${user.uid}/backId.jpg`);
        const businessCertificateUrl = await uploadImage(businessCertificate, `users/${user.uid}/businessCertificate.jpg`);
  
        await firestore().collection('updateaccount').doc(user.uid).set({
          fullname,
          address,
          phone,
          frontIdUrl,
          backIdUrl,
          businessCertificateUrl,
          requestedBy: {
            uid: user.uid,
            username: user.displayName, // hoặc thông tin khác của user
          },
        });
  
        alert('Account updated successfully!');
        navigation.goBack();
      } catch (error) {
        console.error('Error updating account:', error);
        alert('Failed to update account.');
      }
    }
  };
  

  const pickImage = (setter, mode) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    const callback = (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.assets[0].uri };
        setter(source);
      }
    };

    if (mode === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="back" size={30} color="black" />
        </TouchableOpacity>
        <Menu/>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullname}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Front ID</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity onPress={() => pickImage(setFrontId, 'camera')} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage(setFrontId, 'gallery')} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
        {frontId && <Image source={frontId} style={styles.image} />}

        <Text style={styles.label}>Back ID</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity onPress={() => pickImage(setBackId, 'camera')} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage(setBackId, 'gallery')} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
        {backId && <Image source={backId} style={styles.image} />}

        <Text style={styles.label}>Business Certificate</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity onPress={() => pickImage(setBusinessCertificate, 'camera')} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage(setBusinessCertificate, 'gallery')} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
        {businessCertificate && <Image source={businessCertificate} style={styles.image} />}

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'blue',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#000', // Màu chữ đen
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    color: '#000', // Màu chữ đen
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#000', // Màu chữ đen
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    marginTop: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
