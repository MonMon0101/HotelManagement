import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SignupScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [username, setUsername] = useState('');

    const handleSignUp = () => {
        if (email && password && confirmPassword && phone && location && username) {
            if (password !== confirmPassword) {
                Alert.alert('Passwords do not match!');
                return;
            }
    

            auth()
                .createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    // Lưu thêm thông tin vào Firestore với vai trò và cấp độ mong muốn
                    return firestore()
                        .collection('users')
                        .doc(user.uid)
                        .set({
                            email: email,
                            phone: phone,
                            location: location,
                            username: username,
                            createdAt: firestore.FieldValue.serverTimestamp(),
                            role: 'user', // Đặt vai trò là user
                            level: 1, // Đặt cấp độ là 1
                        });
                })
                .then(() => {
                    Alert.alert('User account created & signed in!');
                    navigation.navigate('Login'); // Điều hướng đến màn hình đăng nhập
                })
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        Alert.alert('That email address is already in use!');
                    }

                    if (error.code === 'auth/invalid-email') {
                        Alert.alert('That email address is invalid!');
                    }

                    console.error(error);
                });
        } else {
            Alert.alert('Please fill in all fields');
        }
    };

    const handlePhoneChange = (text) => {
        // Lọc bỏ các ký tự không phải số từ `text`
        const formattedText = text.replace(/[^0-9]/g, '');
        setPhone(formattedText);
    };
    const handleLogIn = () =>{
        navigation.navigate("Login");
    }

    return (
        <View style={styles.Container}>
            <View style={styles.TopImageContainer}>
                <Image source={require("../screen/assets/TopVector.png")} style={styles.TopImage} />
            </View>

            <View style={styles.LoginContainer}>
                <Text style={styles.LoginText}>Signup</Text>
            </View>

            <View style={styles.InputContainer}>
                <FontAwesome name={"user"} size={24} color={"gray"} style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Username'
                    value={username}
                    onChangeText={setUsername} />
            </View>

            <View style={styles.InputContainer}>
                <FontAwesome name={"user"} size={24} color={"gray"} style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Email'
                    value={email}
                    onChangeText={setEmail} />
            </View>

            <View style={styles.InputContainer}>
                <FontAwesome name={"lock"} size={24} color={"gray"} style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Password'
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword} />
            </View>

            <View style={styles.InputContainer}>
                <FontAwesome name={"lock"} size={24} color={"gray"} style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Confirm Password'
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword} />
            </View>

            <View style={styles.InputContainer}>
                <Feather name={"smartphone"} size={23} color={"gray"} style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Phone'
                    keyboardType='numeric' // Chỉ cho phép nhập số
                    value={phone}
                    onChangeText={handlePhoneChange} />
            </View>

            <View style={styles.InputContainer}>
                <FontAwesome name={"map-marker"} size={24} color={"gray"} style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Location'
                    value={location}
                    onChangeText={setLocation} />
            </View>

            <TouchableOpacity onPress={handleSignUp}>
                <View style={styles.signinButtonContainer}>
                    <Text style={styles.SigninTextContainer}>Create</Text>
                    <LinearGradient colors={['#F97794', '#623AA2']} style={styles.linearGradient}>
                        <AntDesign name={"arrowright"} size={24} color={"White"} style={styles.InputIcon} />
                    </LinearGradient>
                </View>
            </TouchableOpacity>



            <TouchableOpacity onPress={handleLogIn}>
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Already have an account? 
                    <Text style={{ textDecorationLine: "underline" }}>Login</Text>                   
                </Text>
            </View>
            </TouchableOpacity>
        </View>
    );
}

export default SignupScreen;

const styles = StyleSheet.create({
    Container: {
        backgroundColor: "White",
        flex: 1,
    },
    TopImageContainer: {},
    TopImage: {
        height: 130,
        width: "100%",
    },
    LoginContainer: {},
    LoginText: {
        textAlign: "center",
        fontSize: 40,
        fontWeight: "bold",
        color: "black"
    },
    SigninText: {
        textAlign: "center",
        fontSize: 17,
        color: "black"
    },
    InputContainer: {
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        borderRadius: 20,
        marginHorizontal: 40,
        elevation: 10,
        marginVertical: 10,
        alignItems: "center",
        
    },
    TextInput: {
        flex: 1,
        padding: 10,
        color:'black',
    },
    InputIcon: {
        marginLeft: 12,
        marginRight: 5,
    },
    signinButtonContainer: {
        flexDirection: "row",
        marginTop: 25,
        width: "90%",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    SigninTextContainer: {
        color: "#262626",
        fontSize: 25,
        fontWeight: "bold",
    },
    linearGradient: {
        height: 34,
        width: 56,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 10,
    },
    footerContainer:{
        paddingTop:50,
        alignItems:'center',
        alignContent:'center',

    },
    footerText: {
        color: "black",
        textAlign: "center",
        fontSize: 18,
       
    },
});
