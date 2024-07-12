import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AntDesign from 'react-native-vector-icons/AntDesign';

const RequestUpdateAccount = ({ navigation }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = () => {
      try {
        const unsubscribe = firestore().collection('updateaccount').onSnapshot(snapshot => {
          const data = [];
          snapshot.forEach(async doc => {
            const requestData = doc.data();
            if (requestData && requestData.requestedBy && typeof requestData.requestedBy === 'object') {
              const userSnapshot = await firestore().collection('users').doc(requestData.requestedBy.uid).get();
              if (userSnapshot.exists) {
                const userData = userSnapshot.data();
                const requestWithUser = {
                  id: doc.id,
                  ...requestData,
                  email: userData.email || '',
                };
                data.push(requestWithUser);
              } else {
                console.warn(`User data not found for ID: ${requestData.requestedBy.uid}`);
              }
            } else {
              console.warn('RequestedBy field is missing or invalid.');
            }
          });
          setRequests(data);
        });
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching update account requests:', error);
      }
    };
  
    return fetchRequests();
  }, []);

  const handleDeleteRequest = async (id) => {
    try {
      await firestore().collection('updateaccount').doc(id).delete();
      setRequests(prevRequests => prevRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const handleAcceptRequest = async (id, userId) => {
    try {
      // Update user level to 2 (assuming you have a 'level' field in users collection)
      await firestore().collection('users').doc(userId).update({
        level: 2,
      });
      // Delete the request from updateaccount collection
      await firestore().collection('updateaccount').doc(id).delete();
      // Update local state by filtering out the accepted request
      setRequests(prevRequests => prevRequests.filter(request => request.id !== id));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handlerBack = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.item}>
        <Text style={styles.label}>Fullname:</Text>
        <Text style={styles.text}>{item.fullname}</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.text}>{item.address}</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.text}>{item.phone}</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>{item.email}</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>Front ID:</Text>
        <Image source={{ uri: item.frontIdUrl }} style={styles.image} />
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>Back ID:</Text>
        <Image source={{ uri: item.backIdUrl }} style={styles.image} />
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>Business Certificate:</Text>
        <Image source={{ uri: item.businessCertificateUrl }} style={styles.image} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeleteRequest(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={() => handleAcceptRequest(item.id, item.requestedBy.uid)}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlerBack}>
          <AntDesign name="back" size={30} color={"white"} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

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
    paddingTop: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'blue',
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginHorizontal: 20, // Thêm margin để các item không bị dính lề
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
    width: 100,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
  },
  acceptButton: {
    backgroundColor: '#32CD32',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RequestUpdateAccount;
