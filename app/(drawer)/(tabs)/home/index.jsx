import { StyleSheet, ScrollView, Text, View, Image, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Drawer } from 'expo-router/drawer'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../../constants'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useGlobalContext } from '../../../../context/GlobalProvider';
import { FlatList } from 'react-native-gesture-handler'
import Expense from '../../../../components/ExpenseItem'
import EmptyState from '../../../../components/EmptyState'
import { getRecentPosts, recoverPwd } from '../../../../lib/appwrite'
import useAppwrite from '../../../../lib/useAppwrite'
import CustomCalendar from '../../../../components/CustomCalendar'
import { router } from 'expo-router'
import NetInfo from '@react-native-community/netinfo';
import FeatherIcon from 'react-native-vector-icons/Feather';


const calculateWidth = (length) => {
  const baseWidth = 300; // Base width for a short currency name
  const additionalWidthPerChar = 10; // Additional width per character
  return baseWidth + (length * additionalWidthPerChar);
};

const Home = () => {
  const navigation = useNavigation();
  const [connectionType, setConnectionType] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [strength, setStrength] = useState('');

  const { user, globalCurrency } = useGlobalContext()
  const [transactionCount, setTransactionCount] = useState(0);

  const { data: recentPosts, refetch } = useAppwrite({
    fn: () => getRecentPosts(user?.$id)
  });

  const [refreshing, setRefreshing] = useState(false)
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('GHS');
  const [currencies, setCurrencies] = useState([]);
  
  const [exchangeRate, setExchangeRate] = useState('0');
  const [totalAmount, setTotalAmount] = useState(0);

  const [boxWidth, setBoxWidth] = useState(calculateWidth(globalCurrency.currency.length));

  useEffect(() => {
    // Calculate the width based on the length of globalCurrency.currency
    const newWidth = calculateWidth(globalCurrency.currency.length);
    setBoxWidth(newWidth);
  }, [globalCurrency.currency]);


  const convertCurrency = () => {
    const result = (1 * exchangeRate).toFixed(2);
    return result;
  };

  //console.log(user?.email)
  //console.log(typeof(recoverPwd.isUserVerified()))

  const [showStatus, setShowStatus] = useState(false);

  const handlePress = () => {
    setShowStatus(!showStatus); // Toggle the visibility of the status
  };
 

  const onRefresh = async () => {
    setRefreshing(true)
    // Recall new expenses
    await refetch();
    setRefreshing(false)
  }


  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  useEffect(() => {
    try {
      let total = 0;
      recentPosts.forEach(item => {
      total += item.ItemAmount;
    });
    setTransactionCount(recentPosts.filter(post => post.type === "Expense").length); // Set the number of transactions
    setTotalAmount(total);
    } catch (error) {
      //console.log("No items!");
    }
    
  }, [recentPosts]);

  useEffect(() => {
    const fetchCurrencies = async () => {
     try {
       const response = await fetch(
         'https://v6.exchangerate-api.com/v6/0e6303693a5b845f4814341f/latest/USD' //api
        );
  
        const data = await response.json();
        setCurrencies(Object.keys(data.conversion_rates));
        setExchangeRate(data.conversion_rates[toCurrency]);
    }	catch (error) {
      console.log(error);
    }
  };
  
  fetchCurrencies();
  }, [toCurrency]);

  // Check internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(state.type);
      setIsConnected(state.isConnected);

      if (state.type === 'wifi') {
        if (state.details.strength >= 75) {
          setStrength('Strong');
        } else if (state.details.strength >= 50) {
          setStrength('Moderate');
        } else if (state.details.strength >= 25) {
          setStrength('Weak');
        } else {
          setStrength('Poor');
        }
      } else if (state.type === 'cellular') {
        const effectiveType = state.details.cellularGeneration;
        if (effectiveType === '4g') {
          setStrength('Strong');
        } else if (effectiveType === '3g') {
          setStrength('Moderate');
        } else if (effectiveType === '2g') {
          setStrength('Weak');
        } else {
          setStrength('Poor');
        }
      } else {
        setStrength('No connection');
      }
    });

    return async () => {
      unsubscribe();
      await refetch()
    };
  }, []);

  return (
    <>
    {/* <StatusBar hidden="true" /> */}
    <Drawer.Screen 
      options={{
        headerShown: false,
        gestureEnabled: false,      
      }}/>
        <View className=" bg-white">
            <View className="flex-row px-5 mt-[50px] mb-5">
            <View>
                <TouchableOpacity onPress={toggleDrawer}>
                <Image className="w-[40px] h-[40px] rounded-[20px]" source={images.profile_picture}/> 
              </TouchableOpacity> 
            </View >
            <View className="flex-1 items-center pt-2">
              <Text className="text-xl font-mbold">Yo!{" "}
                <Text className="font-mregular"> 
                    {user?.username?.toUpperCase() }
                </Text> </Text>
            </View>

            <View className=" pt-1 -pb-5">
            <TouchableOpacity
              onPress={handlePress}
            >   
              <View style={[showStatus && {marginTop: -10}]}>
                {recoverPwd.isUserVerified ? (
                  <>
                    <FeatherIcon color={"#2ecc71"} name={"user-check"} size={28} />  
                    {showStatus && (
                       <Text style={{ 
                          fontSize: 10, 
                          marginLeft: -20, 
                          color: '#2ecc71', 
                          borderWidth: 1, 
                          borderRadius: 5, 
                          paddingHorizontal: 3.5, 
                          paddingVertical: 3, 
                          borderColor: '#2ecc71' }}>
                       Not Verified
                     </Text> 
                    )}            
                              
                    </>
                  ) : (
                  <>
                    <FeatherIcon color={"#f00"} name={"user-x"} size={24} />              
                    {showStatus && (
                       <Text style={{ fontSize: 10, marginLeft: -20, color: 'red', borderWidth: 1, borderRadius: 5, paddingHorizontal: 3.5, paddingVertical: 3, borderColor: 'red' }}>
                       Not Verified
                     </Text> 
                    )}            
                      </>
                )}
              </View>
            </TouchableOpacity>
            </View>
            </View>
        </View>
        <SafeAreaView className="flex-1">
        <View className="flex-1 px-[15px] bg-gray -mt-6 rounded-t-xl">
          <View className="flex-row font-mbold justify-betweenw-full">

            <View style={
                [styles.summaryBox, 
                  styles.activeSummaryBox,
                  { width: `${Math.min(43 + totalAmount.toString().length * 2, 100)}%`}
                 ]} 
              className={`-ml-[3px] w-[50%]`}>

              <View className="flex-row gap-[50px]">
                <Ionicons name="card-outline" size={26} color="#FFF" className=""/>
                <Text className="relative font-mbold text-3xl text-white -right-6">{globalCurrency.currency}</Text>
              </View>
              <View className="flex-row gap-4">
                <Text style={[styles.summaryText, styles.activeSummaryText, {  }]}>Total{'\n'}Expense </Text>
                <Text style={[styles.summaryAmount, styles.activeSummaryAmount]} 
                  className="absolute top-4 left-[70px]" 
                  numberOfLines={1}>{totalAmount.toFixed(2)}</Text>
              </View>

            </View>

            <View style={[styles.summaryBox]}>
              <Ionicons name="cash-outline" size={24} color="#000" />
              <Text style={styles.summaryText}>Exchange Rate</Text>
              <Text style={styles.summaryAmount}>1 USD = GHS {convertCurrency()}</Text>
            </View>

          </View>
          
          <View className=" bg-white rounded-xl h-[125px] mt-5">
            <CustomCalendar />
          </View>

          <View className="flex-row justify-between items-center mt-4 mb-3">
                <Text className="text-[22px] font-pextrabold">Recent Expenses  <Text className="text-[#106b85] text-lg font-mbold">({transactionCount})</Text></Text>
                <TouchableOpacity onPress={() => router.push('/(drawer)/all-expense')}>
                  <View className=" p-1 px-2 rounded-lg">
                  <Text className="font-pbold text-tertiary-100 underline">View All</Text>
                  </View>
                </TouchableOpacity>
            </View>

        <View className="flex-1 -mb-10">
          <FlatList 
            data={recentPosts}
            showsVerticalScrollIndicator='false'
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => {
              return (
                <View className="w-full">
                  <Expense 
                    amount={item.ItemAmount} 
                    item={item.item} 
                    category={item.category}
                    expenseType={item.type}
                    purchaseDate={item.dateofpurchase}
                    index={item.$id}

                    />
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <EmptyState title="No Expense Available" subtitle="You have no purchase"/>
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
           
          /> 
        </View>

      
{/* 
      <CustomButton 
        title="scroll to the end" 
        onPress={() => {
          ref.current?.scrollToEnd()
        }} /> */}

    </View>

    </SafeAreaView>
    </>
  );
};


const styles = StyleSheet.create({
summaryBox: {
  backgroundColor: '#FFF',
  paddingHorizontal: 10,
  paddingVertical: 15,
  borderRadius: 10,
  alignItems: 'start',
  marginHorizontal: 5,
},
activeSummaryBox: {
  backgroundColor: '#0161C7',
},
summaryText: {
  marginTop: 10,
  fontSize: 16,
  paddingTop: 7,
  color: '#000',
},
activeSummaryText: {
  color: '#FFF',
},
summaryAmount: {
  marginTop: 5,
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000',
},
activeSummaryAmount: {
  color: '#FFF',
  fontSize: 25,
  //minWidth: 60,
}
})

export default Home
