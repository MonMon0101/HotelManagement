import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 


const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('huy85667@gmail.com');
    const [password, setPassword] = useState('12345Huy');

    const handlerRegister = () => {
        navigation.navigate("Signup");
    }

    const handlerHome = () => {
        if (email && password) {
            auth()
                .signInWithEmailAndPassword(email, password)
                .then(async () => {
                    const userCredential = await auth().currentUser;
                    if (userCredential) {
                        const userDoc = await firestore().collection('users').doc(userCredential.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            const role = userData.role;
                            
                            if (role === 'admin') {
                                navigation.navigate("Admin");
                            } else {
                                navigation.navigate("Main");
                            }
                        } else {
                            Alert.alert('User data not found.');
                        }
                    } else {
                        Alert.alert('User not authenticated.');
                    }
                })
                .catch(error => {
                    if (error.code === 'auth/user-not-found') {
                        Alert.alert('No user corresponding to the given email.');
                    } else if (error.code === 'auth/wrong-password') {
                        Alert.alert('Wrong password.');
                    } else {
                        Alert.alert(error.message);
                    }
                });
        } else {
            Alert.alert('Please fill in all fields');
        }
    }

    return (
        <View style={styles.Container}>
            <View style={styles.TopImageContainer}>
                <Image source={require("../screen/assets/TopVector.png")}
                    style={styles.TopImage} />
            </View>

            <View style={styles.LoginContainer}>
                <Text style={styles.LoginText}>Login</Text>
            </View>
            <View>
                <Text style={styles.SigninText}>Signin your account</Text>
            </View>
            <View style={styles.InputContainer}>
                <FontAwesome
                    name={"user"}
                    size={24}
                    color={"gray"}
                    style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Email'
                    value={email}
                    onChangeText={setEmail} />
            </View>

            <View style={styles.InputContainer}>
                <AntDesign
                    name={"lock"}
                    size={24}
                    color={"gray"}
                    style={styles.InputIcon} />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Password'
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword} />
            </View>

            <View>
                <Text style={styles.forgotPasswordText}>Forgot your Password?  </Text>
            </View>
            <TouchableOpacity onPress={handlerHome}>
                <View style={styles.signinButtonContainer}>
                    <Text style={styles.SigninTextContainer}>Sign In</Text>
                    <LinearGradient colors={['#F97794', '#623AA2']} style={styles.linearGradient}>
                        <AntDesign name={"arrowright"} size={24} color={"White"} style={styles.InputIcon} />
                    </LinearGradient>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlerRegister}>
                <View style={styles.signupContainer}>
                    <Text style={styles.footerText}> Don’t have an account?<Text style={{ textDecorationLine: "underline" }}>Create</Text> </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default LoginScreen

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
        marginVertical: 20,
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
    forgotPasswordText: {
        color: "black",
        textAlign: "right",
        fontSize: 15,
        width: "90%",
    },
    signinButtonContainer: {
        flexDirection: "row",
        marginTop: 120,
        width: "90%",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    SigninTextContainer: {
        color: "black",
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
    footerText: {
        color: "black",
        textAlign: "center",
        fontSize: 18,
        marginTop: 120,
    },
});
