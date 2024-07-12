import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import DetailsScreen from './DetailsScreen';
import FavouriteScreen from './FavouriteScreen';
import SearchScreen from './SearchScreen';
import EditProfileScreen from './EditProfileScreen';
import AddHotelScreen from './AddHotelScreen';
import ServiceScreen from './ServiceScreen';
import EditHotelScreen from './EditHotelScreen';
import BookingScreen from './BookingScreen';
import AdminScreen from './AdminScreen';
import ManageUsersAdmin from './admin/ManageUsersAdmin';
import ManageHotelsScreen from './admin/ManageHotelsScreen';
import ManageHomeContentScreen from './admin/ManageContentHome';
import Menu from './Component/Menu'; 
import HotelBookedScreen from './HotelBookedScreen';
import UpdateAccountScreen from './Component/UpdateAccount';
import RequestUpdateAccount from './admin/RequestUpdateAccount';
import CommentSection from './Component/CommentSection';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name='Admin' component={AdminScreen}/>
    <Stack.Screen name='ManageUsers' component={ManageUsersAdmin}/>
    <Stack.Screen name='ManageHotels' component={ManageHotelsScreen}/>
    <Stack.Screen name='ManageHomeContent' component={ManageHomeContentScreen}/>
    <Stack.Screen name='UpdateAccount' component={RequestUpdateAccount}/>
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Service" component={ServiceScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Details" component={DetailsScreen} />
    <Stack.Screen name="Favourite" component={FavouriteScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="AddHotel" component={AddHotelScreen} />
    <Stack.Screen name='EditHotel' component={EditHotelScreen}/>
    <Stack.Screen name='Booking' component={BookingScreen}/>
    <Stack.Screen name='Booked' component={HotelBookedScreen}/>
    <Stack.Screen name='UpdateAccount' component={UpdateAccountScreen}/>
    <Stack.Screen name='Comment' component={CommentSection}/>
  </Stack.Navigator>
);

const Router = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Router;
