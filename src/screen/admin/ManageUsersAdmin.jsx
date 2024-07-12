import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, ToastAndroid } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

export default function ManageUsersScreen() {
  const navigation = useNavigation(); 
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: 'user', // Default role as user
    level: '', // Default empty level
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await firestore().collection('users').get();
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditedUser({
      username: user.username,
      email: user.email,
      password: user.password,
      phone: user.phone,
      location: user.location,
      role: user.role,
      level: user.level // Include level in editedUser state
    });
    setModalVisible(true);
  };

  const handleUpdateUser = async () => {
    try {
      await firestore().collection('users').doc(selectedUser.id).update({
        username: editedUser.username,
        email: editedUser.email,
        password: editedUser.password,
        phone: editedUser.phone,
        location: editedUser.location,
        level: editedUser.level // Update level in Firestore
      });
      ToastAndroid.show('User updated successfully', ToastAndroid.SHORT);
      setModalVisible(false);
      fetchUsers(); // Refresh user list after update
    } catch (error) {
      console.error('Error updating user: ', error);
      ToastAndroid.show('Failed to update user', ToastAndroid.SHORT);
    }
  };

  const handleAddUser = async () => {
    try {
      await firestore().collection('users').add({
        username: editedUser.username || 'Username',
        email: editedUser.email || 'Email',
        password: editedUser.password || 'Password',
        phone: editedUser.phone || 'Phone',
        location: editedUser.location || 'Location',
        role: editedUser.role || 'user',
        level: editedUser.level || 'Level' // Assuming 'Level' is a string
      });
      ToastAndroid.show('User added successfully', ToastAndroid.SHORT);
      setModalVisible(false);
      setEditedUser({
        username: '',
        email: '',
        password: '',
        phone: '',
        location: '',
        role: 'user', // Reset role to default after adding user
        level: '' // Reset level to empty string after adding user
      });
      setSelectedUser(null); // Reset selectedUser to null
    } catch (error) {
      console.error('Error adding user: ', error);
      ToastAndroid.show('Failed to add user', ToastAndroid.SHORT);
    }
  };
  

  const handleDeleteUser = async (userId) => {
    try {
      await firestore().collection('users').doc(userId).delete();
      ToastAndroid.show('User deleted successfully', ToastAndroid.SHORT);
      fetchUsers(); // Refresh user list after delete
    } catch (error) {
      console.error('Error deleting user: ', error);
      ToastAndroid.show('Failed to delete user', ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleEditUser(item)}>
      <View>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
        <Text style={styles.userLevel}>Level: {item.level}</Text>
      </View>
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
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.userList}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => { setSelectedUser(null); setModalVisible(true); }}>
        <Text style={styles.addButtonText}>Add User</Text>
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
              value={editedUser.username}
              onChangeText={text => setEditedUser(prev => ({ ...prev, username: text }))}
              placeholder="Username"
            />
            <TextInput
              style={styles.input}
              value={editedUser.email}
              onChangeText={text => setEditedUser(prev => ({ ...prev, email: text }))}
              placeholder="Email"
            />
            <TextInput
              style={styles.input}
              value={editedUser.password}
              onChangeText={text => setEditedUser(prev => ({ ...prev, password: text }))}
              placeholder="Password"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={editedUser.phone}
              onChangeText={text => setEditedUser(prev => ({ ...prev, phone: text }))}
              placeholder="Phone"
            />
            <TextInput
              style={styles.input}
              value={editedUser.location}
              onChangeText={text => setEditedUser(prev => ({ ...prev, location: text }))}
              placeholder="Location"
            />
            <TextInput
              style={styles.input}
              value={editedUser.level}
              onChangeText={text => setEditedUser(prev => ({ ...prev, level: text }))}
              placeholder="Level"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={selectedUser ? handleUpdateUser : handleAddUser}>
                <Text style={styles.buttonText}>{selectedUser ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              {selectedUser && (
                <TouchableOpacity style={styles.modalButton} onPress={() => handleDeleteUser(selectedUser.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
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
  userList: {
    flex: 1,
  },
  userItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'gray',
  },
  userRole: {
    fontSize: 14,
    color: 'green',
    fontStyle: 'italic',
  },
  userLevel: {
    fontSize: 14,
    color: 'blue',
    fontStyle: 'italic',
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
    color: 'black',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});
