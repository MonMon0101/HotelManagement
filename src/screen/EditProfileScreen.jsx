import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Modal, TextInput, TouchableOpacity, Button, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import Menu from './Component/Menu';

const EditProfileScreen = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [editedLocation, setEditedLocation] = useState('');
    const [avatar, setAvatar] = useState(null);

    const navigation = useNavigation();

    const handlerBack = () => {
        navigation.goBack();
    };

    useEffect(() => {
        const fetchData = async () => {
            const user = auth().currentUser;
            if (user) {
                const userDoc = await firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const { username, email, phone, location, avatarUrl } = userDoc.data();
                    setUserData({ username, email, phone, location, avatarUrl });
                    setEditedUsername(username);
                    setEditedPhone(phone);
                    setEditedLocation(location);
                    setAvatar(avatarUrl);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const saveEditedData = async () => {
        if (!editedUsername.trim() || !editedPhone.trim() || !editedLocation.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        const user = auth().currentUser;
        if (user) {
            await firestore().collection('users').doc(user.uid).update({
                username: editedUsername,
                phone: editedPhone,
                location: editedLocation,
                avatarUrl: avatar
            });
            setUserData({
                ...userData,
                username: editedUsername,
                phone: editedPhone,
                location: editedLocation,
                avatarUrl: avatar
            });
        }
        setEditModalVisible(false);
    };

    const pickImage = async () => {
        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            if (!response.didCancel && !response.error) {
                const uri = response.assets[0].uri;
                uploadImage(uri);
            }
        });
    };

    const uploadImage = async (uri) => {
        const user = auth().currentUser;
        if (user) {
            const filename = uri.substring(uri.lastIndexOf('/') + 1);
            const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
            const storageRef = storage().ref(`Images/${user.uid}/${filename}`);
            const task = storageRef.putFile(uploadUri);
    
            try {
                await task;
                const url = await storageRef.getDownloadURL();
                setAvatar(url);
                await firestore().collection('users').doc(user.uid).update({
                    avatarUrl: url,
                });
            } catch (e) {
                console.error(e);
                Alert.alert('Upload failed', 'Sorry, we were unable to upload your image.');
            }
        }
    };
    

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handlerBack}>
                    <AntDesign name="back" size={30} color={"black"} />
                </TouchableOpacity>
                <Text style={styles.profileText}>Profile</Text>
                <Menu/>
            </View>

            <View style={styles.profileContainer}>
                
                <TouchableOpacity onPress={pickImage}>
                    <Image
                        source={avatar ? { uri: avatar } : require('./assets/TopVector.png')}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>

            {userData && (
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <FontAwesome name="user" size={24} color="gray" style={styles.infoIcon} />
                        <Text style={styles.infoText}>{userData.username}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <FontAwesome name="envelope" size={24} color="gray" style={styles.infoIcon} />
                        <Text style={styles.infoText}>{userData.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Feather name="smartphone" size={24} color="gray" style={styles.infoIcon} />
                        <Text style={styles.infoText}>{userData.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <FontAwesome name="map-marker" size={24} color="gray" style={styles.infoIcon} />
                        <Text style={styles.infoText}>{userData.location}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        setEditedUsername(userData.username);
                        setEditedPhone(userData.phone);
                        setEditedLocation(userData.location);
                        setEditModalVisible(true);
                    }}>
                        <Text style={styles.editButton}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new username"
                            value={editedUsername}
                            onChangeText={(text) => setEditedUsername(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new phone number"
                            value={editedPhone}
                            onChangeText={(text) => setEditedPhone(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new location"
                            value={editedLocation}
                            onChangeText={(text) => setEditedLocation(text)}
                        />
                        <Button title="Save" onPress={saveEditedData} />
                        <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
                    </View>
                </View>
            </Modal>
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
        
        justifyContent:'space-between',
        paddingHorizontal: 8,
        paddingTop: 20,
        
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#007bff',
    },
    profileContainer: {
        alignItems: 'center',
        backgroundColor:'grey',
    },
    profileText: {
        textAlign: 'center',
        fontSize: 40,
        fontWeight: 'bold',
        color: 'black',
        
    },
    avatar: {
        width: 200,
        height: 200,
        borderRadius: 50,
        marginVertical: 20,
        borderWidth:2,
        borderColor:'grey',
        
    },
    infoContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
        borderRadius:10,
        borderTopWidth:2,
    
        
       
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    infoIcon: {
        marginRight: 10,
    },
    infoText: {
        fontSize: 18,
        color: 'black',
    },
    editButton: {
        fontSize: 18,
        color: 'black',
        marginTop: 10,
        textAlign: 'center',
        backgroundColor: '#007bff',
        borderRadius: 5,
        padding: 5,
        fontWeight: 'bold',
        marginHorizontal: 100,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
});

export default EditProfileScreen;
