import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Menu from './Component/Menu';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handlerLogout = () => {
    auth()
      .signOut()
      .then(() => {
        navigation.navigate('Login');
      });
  };

  const handlerEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handlerUpdateAccount = () => {
    if (userData && userData.level >= 2) {
      Alert.alert('Thông báo', 'Bạn đã được phê duyệt và không được phép sử dụng chức năng này.');
    } else {
      navigation.navigate('UpdateAccount');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f6' }}>
      <View style={styles.header}>
        <Menu />
      </View>

      <View style={styles.container}>
        <View style={styles.profile}>
          <Image
            source={{
              uri: userData?.avatarUrl || 'https://via.placeholder.com/150', // Default placeholder if no avatarUrl is provided
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.proFileNameContainer}>
            <Text style={styles.profileName}>{userData?.username}</Text>
            <Text style={styles.profileEmail}>{userData?.email}</Text>
          </View>
        </View>
        <View style={styles.serviceContainer}>
          <TouchableOpacity onPress={handlerEditProfile}>
            <View style={styles.profileAction}>
              <Text style={styles.profileActionText}>Edit Profile</Text>
              <FeatherIcon color="#fff" name="edit" size={16} />
            </View>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <AntDesign name={'setting'} size={24} color={'#808080'} style={styles.InputIcon} />
            <Text style={styles.footerText}>Setting</Text>
          </View>

          <TouchableOpacity onPress={handlerUpdateAccount}>
            <View style={styles.footerContainer}>
              <MaterialCommunityIcons name={'account-arrow-up'} size={24} color={'#808080'} style={styles.InputIcon} />
              <Text style={styles.footerText}>Update Account</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlerLogout}>
            <View style={styles.footerContainer}>
              <AntDesign name={'logout'} size={24} color={'#808080'} style={styles.InputIcon} />
              <Text style={styles.footerText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header:{
    flexDirection:'row-reverse',
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#007bff',
    paddingTop:25,
  },
  profile: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
  },
  proFileNameContainer: {
    marginLeft: 16,
  },
  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#090909',
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '400',
    color: '#848484',
  },
  profileAction: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 12,
  },
  profileActionText: {
    marginRight: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  serviceContainer: {},
  footerContainer: {
    paddingLeft: 10,
    height: 50,
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  footerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 20,
  },
  InputIcon: {
    marginLeft: 12,
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
