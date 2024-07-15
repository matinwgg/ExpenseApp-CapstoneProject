import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native'
import React, {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../constants'
import FormField from '../../components/FormField'
import {Link, router} from 'expo-router'
import CustomButton  from '../../components/CustomButton'
import { createUser } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const EMAIL_REGEX =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [isSubmitting, setIsSubmitting] = useState(false)  
  const [error, setError] = useState()

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    confirmpwd: '',
})

const submit = async () => {
      if (!form.username || !form.email || !form.password || !form.confirmpwd) {
        return Alert.alert('Error', 'Please fill in all the fields')
      }

    setError(null)
    setIsSubmitting(true)

    try {
    const result = await createUser(form.email, form.password, form.username)
    setUser(result);
    setIsLoggedIn(true);
    Alert.alert("Sign-Up Successful", "Account created")
    router.replace('/sign-in')

  } catch(error) {
    console.log(error)
    setIsSubmitting(false)
    setError(error.message)
  }
    finally { setIsSubmitting(false)

}

    
useEffect(() => {
  if(error) {
    Alert.alert("Something seem broken...", error)
  }
}, [error])

}

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <ScrollView showsVerticalScrollIndicator="false">
      <View>
            <View>
            <Image 
              source={icons.hand_euro} 
              resizeMode='contain'
              className="w-[100px] h-[50px] mt-[20px] self-start -ml-5 mb-5"/>

            <Text className="self-start text-5xl text-[#1F41BB] font-mbold py-5">Sign Up</Text>

          <FormField 
              containerStyle="w-[330px]"
              placeholder={'Username'}
              value={form.username}
              onChangeText={(e) => setForm({ ...form, username: e })}
              contentType='username'
           />

            <FormField 
              containerStyle="w-[330px] mt-5"
              placeholder={'Email address'}
              value={form.email}
              onChangeText={(e) => setForm({...form, email: e})}
              contentType='emailAddress'
              keyType='email-address'
              // emailValidation={isValid}
            />

            <FormField
              containerStyle="w-[330px] mt-5"
              placeholder={'Password'}
              value={form.password}
              onChangeText={(e) => setForm({ ...form, password: e })}
              contentType='password'
              secureTextEntry
            />

            <FormField
              containerStyle="w-[330px] mt-5"
              placeholder={'Confirm Password'}
              value={form.confirmpwd}
              onChangeText={(e) => setForm({ ...form, confirmpwd: e })}
              contentType='password'
              // passwordValidation={isPwdValid}
              secureTextEntry
            />

          <CustomButton 
              title="Register"
              handlePress={submit}
              containerStyles="mt-5"
              isLoading={isSubmitting}
              otherStyles="mt-[80px] mb-[30px] "
          />

            <View className="flex-row self-center">
                <Text className="font-pmedium ">Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/sign-in')}>
                    <Text className="font-pbold text-[#1F41BB]">Sign in</Text> 
                </TouchableOpacity>
            </View>

            </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default SignUp