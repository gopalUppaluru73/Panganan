import {useState, useEffect, useContext} from 'react'
import {SafeAreaView, View, StyleSheet, StatusBar, TouchableOpacity, Text} from 'react-native'
import { colors } from '../config/colors'
import { Context } from '../config/Provider'
import { Ionicons } from '@expo/vector-icons'
import { FontAwesome5 } from '@expo/vector-icons'
import { Feather } from '@expo/vector-icons'
import Button from '../components/Button'
import TextList from '../components/TextList'
import Padder from '../components/Padder'
import Toast from 'react-native-root-toast';

// Firebase Imports
import { app } from '../config/firebase'
import { getDatabase, ref, set, push, update } from 'firebase/database'
import { tablenames } from '../config/tables'

export default function Checkout({ navigation }) {
    const state = useContext(Context)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)

    // Firebase
    const db = getDatabase(app)

    useEffect(()=>{
        navigation.setOptions({
            headerLeft: ()=>(
                <TouchableOpacity onPress={()=>navigation.goBack()} style={{ marginRight: 20 }}>
                    <Ionicons name="arrow-undo-sharp" size={24} color="black" />
                </TouchableOpacity>
            ),
            headerRight: ()=>(
                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <View style={{ flexDirection: 'row' }}>
                        <FontAwesome5 name="shopping-cart" size={17} color="#000" />
                        <Text style={{ marginLeft: 3, color: colors.orange, fontWeight: 'bold' }}>{state.cartQty}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
    })

    const handlePayment = async() => {
        const contact = {
            name: `${state.contact.firstname} ${state.contact.lastname}`,
            email: state.contact.email,
            address: state.contact.address,
            contact: state.contact.contact
        }
        const order = { 
            amount: total, 
            cart: state.cart, 
            contact: contact, 
            date: new Date().toLocaleDateString() 
        }
        const updateObj = {
            ...state.contact, 
            order: state.contact?.order ? [...state.contact.order, order] : [order]
        }
        push(ref(db, tablenames.orders), order)
        set(ref(db, `${tablenames.login}/${updateObj.id}`), updateObj)
        .then(()=>{
            state.setContact(updateObj)
            Toast.show('Payment successful', {
                duration: Toast.durations.LONG, position: Toast.positions.CENTER
            })
        })
        .catch(()=>{
            Toast.show('Payment successful but failed to record transaction', {
                duration: Toast.durations.LONG, position: Toast.positions.CENTER
            })
        })
        .finally(()=>{
            state.setCart([])
            navigation.navigate('Products', {resetFilter: true})
        })
    }

    useEffect(()=>{
        const t = (state.deliveryFee + state.totalFee).toFixed(2)
        setTotal(t)
    }, [])
  return (
    <SafeAreaView style={styles.safearea}>
        <View style={styles.container}>

            <View style={styles.view}>
                <Padder height={20} />
                <View style={{ width: '90%', alignSelf: 'center' }}>
                    <View style={styles.contact}>
                        <View>
                            <Ionicons name="radio-button-on" size={24} color="black" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10}}>
                            <Text style={{ fontWeight: "bold", fontSize: 20 }}>Address</Text>
                            <Padder height={5} />
                            <Text>{state.contact.firstname} {state.contact.lastname}</Text>
                            <Text>{state.contact.address}</Text>
                            <Text>{state.contact.contact}</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={()=>navigation.navigate('EditDetails')}>
                                <Feather name="edit-3" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Padder />
                </View>
            </View>

            <View style={styles.checkoutButton}>
                <View style={{ width: '90%', alignSelf: 'center' }}>
                    <Padder />
                    <TextList fontSize={16} fontWeight={600} label="SubTotal" text={`$${state.totalFee.toFixed(2)}`} />
                    <TextList fontSize={16} fontWeight={800} label="Total" text={`$${(state.totalFee + state.deliveryFee).toFixed(2)}`} />
                    <Padder />
                    <Button btnName="Proceed to Order" onPress={handlePayment} padding={15} disabled={loading} loading={loading} />
                </View>
            </View>

        </View>
        <StatusBar backgroundColor={colors.orange} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    safearea: {
        flex: 1
    },
    contact: {
        padding: 15,
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderRadius: 5,
        elevation: 3,
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {
            height: 0.3,
            width: 0.1,
        }
    },
    container: {
        flex: 1
    },
    checkoutButton: {
        flex: 2,
        backgroundColor: '#fff',
    },
    view: {
        flex: 6
    }
})