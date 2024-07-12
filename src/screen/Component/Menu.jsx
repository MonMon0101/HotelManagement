import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

const Menu = () => {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const user = auth().currentUser;
                if (user) {
                    const userDoc = await firestore().collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        setUser(userDoc.data());
                    }
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    const openMenu = () => {
        setModalVisible(true); // Mở modal menu
    };

    const closeMenu = () => {
        setModalVisible(false); // Đóng modal menu
    };

    const handlerLogout = () => {
        auth()
          .signOut()
          .then(() => {
            navigation.navigate('Login');
          });
    };

    const goToScreen = (screenName) => {
        navigation.navigate(screenName);
        closeMenu();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <>
            <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
                <AntDesign name="bars" size={40} color="black" />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeMenu}
            >
                <TouchableOpacity style={styles.modalBackground} onPress={closeMenu}>
                    <View style={styles.modalView}>
                        <View style={styles.userInfoSection}>
                            {user && (
                                <>
                                    <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                                    <Text style={styles.username}>{user.username}</Text>
                                    <Text style={styles.email}>{user.email}</Text>
                                </>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => goToScreen('Home')}>
                            <Text style={styles.modalText}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => goToScreen('Profile')}>
                            <Text style={styles.modalText}>Setting</Text>
                        </TouchableOpacity>
                        {user && user.level !== 1 && ( // Kiểm tra cấp độ người dùng để ẩn mục "Service"
                            <TouchableOpacity onPress={() => goToScreen('Service')}>
                                <Text style={styles.modalText}>Service</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => goToScreen('Favourite')}>
                            <Text style={styles.modalText}>Favourite</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlerLogout}>
                            <Text style={styles.modalText}>Logout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                            <Text style={styles.modalText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    menuButton: {
        marginRight: 20, // Đẩy nút menu về bên phải
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end', // Căn chỉnh menu về bên phải
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu nền đen đậm và mờ
    },
    modalView: {
        width: '50%', // Chiếm nửa màn hình bên phải
        height: '100%', // Chiếm toàn bộ chiều cao màn hình
        backgroundColor: 'rgba(50, 50, 50, 0.8)', // Màu nền menu mờ đen xám
        padding: 20,
        borderRadius: 0, // Không cần bo tròn góc
        alignItems: 'flex-start',
    },
    userInfoSection: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    username: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white', // Màu chữ trắng
    },
    email: {
        fontSize: 16,
        color: 'white', // Màu chữ trắng
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: 'white', // Màu chữ trắng
    },
    closeButton: {
        marginTop: 20,
    },
});

export default Menu;
