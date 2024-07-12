import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AdminScreen = () => {
  const navigation = useNavigation();

  const navigateToManageHotels = () => {
    navigation.navigate('ManageHotels'); // Điều hướng tới màn hình quản lý khách sạn
  };

  const navigateToManageUsers = () => {
    navigation.navigate('ManageUsers'); // Điều hướng tới màn hình quản lý người dùng
  };

  const navigateToManageHomepageContent = () => {
    navigation.navigate('ManageHomeContent'); // Điều hướng tới màn hình quản lý nội dung trang chủ
  };

  const navigateToManageRequest = () => {
    navigation.navigate('UpdateAccount'); // Điều hướng tới màn hình quản lý yêu cầu
  };

  const handleLogout = () => {
 
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Avatar (Nếu cần, bạn có thể thêm ở đây) */}
      <Text style={styles.heading}>Admin Panel</Text>
      <Text style={styles.description}>Bạn muốn dùng chức năng gì?</Text>

      <TouchableOpacity style={styles.button} onPress={navigateToManageHotels}>
        <Text style={styles.buttonText}>Quản lý khách sạn</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={navigateToManageUsers}>
        <Text style={styles.buttonText}>Quản lý người dùng</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={navigateToManageHomepageContent}>
        <Text style={styles.buttonText}>Quản lý nội dung trang chủ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={navigateToManageRequest}>
        <Text style={styles.buttonText}>Yêu cầu cập nhật tài khoản</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
