import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Image, TextInput, ToastAndroid, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-picker'; // Import thư viện image picker
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

export default function ManageHomepageContent() {
  const navigation = useNavigation();
  const [panelImages, setPanelImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedImage, setEditedImage] = useState({
    imageUrl: '',
    createdAt: new Date(),
  });

  useEffect(() => {
    fetchPanelImages();
  }, []);

  const fetchPanelImages = async () => {
    try {
      const imagesSnapshot = await firestore().collection('homepage').get();
      const imagesData = imagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPanelImages(imagesData);
    } catch (error) {
      console.error('Error fetching panel images: ', error);
    }
  };

  const handleEditImage = (image) => {
    setSelectedImage(image);
    setEditedImage({
      imageUrl: image.imageUrl,
      createdAt: image.createdAt.toDate(), // Assuming createdAt is stored as a Firebase timestamp
    });
    setModalVisible(true);
  };

  const handleUpdateImage = async () => {
    try {
      await firestore().collection('homepage').doc(selectedImage.id).update({
        imageUrl: editedImage.imageUrl,
        createdAt: editedImage.createdAt,
      });
      ToastAndroid.show('Panel image updated successfully', ToastAndroid.SHORT);
      setModalVisible(false);
      fetchPanelImages(); // Refresh the list after update
    } catch (error) {
      console.error('Error updating panel image: ', error);
      ToastAndroid.show('Failed to update panel image', ToastAndroid.SHORT);
    }
  };

  const handleAddImage = async () => {
    try {
      let imageUrl = editedImage.imageUrl;
      
      // Chọn ảnh từ album của máy
      const chooseFromDevice = async () => {
        const imagePickerOptions = {
          title: 'Select Image',
          storageOptions: {
            skipBackup: true,
            path: 'images',
          },
        };
        ImagePicker.showImagePicker(imagePickerOptions, async (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else {
            const imageUri = Platform.OS === 'ios' ? response.uri.replace('file://', '') : response.uri;
            const imageRef = storage().ref(`panel_images/${Date.now()}`);
            await imageRef.putFile(imageUri);
            imageUrl = await imageRef.getDownloadURL();

            // Thêm URL ảnh vào Firestore
            await firestore().collection('homepage').add({
              imageUrl,
              createdAt: new Date(),
            });
            ToastAndroid.show('Panel image added successfully', ToastAndroid.SHORT);
            setModalVisible(false);
            setEditedImage({
              imageUrl: '',
              createdAt: new Date(),
            });
            fetchPanelImages(); // Cập nhật danh sách sau khi thêm
          }
        });
      };

      // Dùng link ảnh
      const useImageUrl = async () => {
        await firestore().collection('homepage').add({
          imageUrl,
          createdAt: new Date(),
        });
        ToastAndroid.show('Panel image added successfully', ToastAndroid.SHORT);
        setModalVisible(false);
        setEditedImage({
          imageUrl: '',
          createdAt: new Date(),
        });
        fetchPanelImages(); // Cập nhật danh sách sau khi thêm
      };

      // Hiển thị modal chọn phương thức
      const showChooseMethodModal = () => {
        // Implement your modal here
        // Example: setChooseMethodModalVisible(true);
      };

      showChooseMethodModal(); // Hiển thị modal chọn phương thức
    } catch (error) {
      console.error('Error adding panel image: ', error);
      ToastAndroid.show('Failed to add panel image', ToastAndroid.SHORT);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await firestore().collection('homepage').doc(imageId).delete();
      ToastAndroid.show('Panel image deleted successfully', ToastAndroid.SHORT);
      fetchPanelImages(); // Refresh the list after delete
    } catch (error) {
      console.error('Error deleting panel image: ', error);
      ToastAndroid.show('Failed to delete panel image', ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.imageItem} onPress={() => handleEditImage(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.imageDate}>{item.createdAt.toDate().toLocaleString()}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteImage(item.id)}>
        <AntDesign name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    <View style={styles.header}>
        <TouchableOpacity onPress={()=> navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Manage Users</Text>
      </View>

      <FlatList
        data={panelImages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.imageList}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => { setSelectedImage(null); setModalVisible(true); }}>
        <Text style={styles.addButtonText}>Add Image</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={editedImage.imageUrl}
              onChangeText={text => setEditedImage(prev => ({ ...prev, imageUrl: text }))}
              placeholder="Image URL or choose from device"
            />
            {/* Date picker or input for createdAt */}
            {/* Assuming you have a component or logic to pick date */}
            <TouchableOpacity style={styles.modalButton} onPress={selectedImage ? handleUpdateImage : handleAddImage}>
              <Text style={styles.buttonText}>{selectedImage ? 'Update Image' : 'Add Image'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    marginBottom: 20,
    
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#007bff',
  },



  imageList: {
    flex: 1,
  },
  imageItem: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageDate: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
