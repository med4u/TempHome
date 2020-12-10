import * as React from "react"
import {observer} from "mobx-react"
import {ScrollView, View, ViewStyle, Platform, Dimensions, FlatList} from "react-native"
import i18n from "i18n-js"

import {Text} from "../../components/text"
import {NavigationScreenProps} from "react-navigation"

import TabBar from "../../modules/TabBar"
import {Avatar, Button, Card, Divider, Icon, ListItem, Overlay} from 'react-native-elements'
import {create} from "apisauce";

import {BadgeTemp} from "../../components/BadgeTemp";
import AsyncStorage from "@react-native-community/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { color } from "../../theme"
import { palette } from "../../theme/palette"

export interface MainScreenProps extends NavigationScreenProps<{}> {
}

/* STYLE */
const MAINVIEW: ViewStyle = {
    flex: 1, 
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    backgroundColor:palette.black

}
const IP: ViewStyle = {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
}
const CARDCONTAINER: ViewStyle = {
    flex: 1,
    borderRadius: 10,
    borderColor: "transparent",
    backgroundColor: "black",
    opacity: 1,
   width: Dimensions.get("window").width - 30,
    marginBottom: 0,
}

/*Variables */
let btimer; //Timer for bridgeIP
let atimer; // Timer for authID
let temperatures = [{Capteur: 'Salon - FAKE', Temp: 20}];

// @inject("mobxstuff")
@observer
export class MainScreen extends React.Component<MainScreenProps, {}> {
    state= {
        tabSelected:0,
        bridgeIP: "",
        authID:"",
        isLoading:true,
        isOverlayVisible:true,
        temps: [{Capteur: '(faux)Salon', Temp: 20}],
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    };

    constructor(props) {
        super(props);
        this.navigateTab = this.navigateTab.bind(this);// https://ourcodeworld.com/articles/read/409/how-to-update-parent-state-from-child-component-in-react
     //   this.onLayout = this.onLayout.bind(this);
    }


    componentDidMount(): void {
        this.loadSavedData();
        Dimensions.addEventListener("change", (e) => { //https://stackoverflow.com/questions/29914572/react-native-flex-not-responding-to-orientation-change
            this.setState(e.window);
        });
       this.setState({tabSelected:0}); //Initial! needed!
    }

    componentWillUnmount(): void {
        try {
            AsyncStorage.setItem('authID', this.state.authID).catch(console.log);
        } catch (e) {
            console.log(e);
        }
    }

    bridgeIPTimer(terminator = false): void {
        if (terminator) {
            console.log("stoptimer bridgeIP")
            clearTimeout(btimer);
        } else {
            btimer = setInterval(this.getbridgeIP, 2000);
        }
    }

    authIDTimer(terminator = false): void {
        if (terminator) {
            console.log("stoptimer authID")
            clearTimeout(atimer);
        } else {
            atimer = setInterval(this.getauthID, 2000);
        }
    }

    /* Fonction pour récuperer en mémoire bridgeIP et auhID */
    loadSavedData = async () => {
        /* TODO: Discuter de la pertinence de stocker l'IP au delà du state :
         TODO : - Coupure d'internet mais ok/réseau domicile
        AsyncStorage.getItem('bridgeIP')
            .then((storedIP)=>
            {
                if(storedIP){
                    this.setState({bridgeIP:storedIP});
                }
                else{
                    // null : no bridgeIP stored so we try to get it:
                    */
        if (this.state.bridgeIP === (null || '')) {
            console.log('Boucle bridgeIP');
            this.bridgeIPTimer(false);
        } else {
            console.log('this.state.bridgeIP is ', this.state.bridgeIP)
        }
        /* }
         console.log('IP Storage:'+ storedIP);
     })
     .catch((error)=>{
         console.log(error);});*/

        AsyncStorage.getItem('authID')
            .then((storedAuthID) => {
                if (storedAuthID) {
                    this.setState({authID: storedAuthID});
                } else {
                    // null : no authID stored so we try to get it:
                    if (this.state.authID === (null || '')) {
                        console.log('Boucle authID');
                        this.authIDTimer(false);
                    } else {
                        console.log('this.state.authID is', this.state.authID)
                    }

                }
                console.log('AuthID Storage:' + storedAuthID)
            })
            .catch((error) => console.log(error))
    }

    //  nextScreen = () => this.props.navigation.navigate("secondExample")

    /* Fonction permettant de faire passer ensuite tabSelected au composant Tabbar et switcher de tab*/
    navigateTab = (index) => {
        this.setState({tabSelected: index});
    }

    /* si absence d'IP de pont déjà enregistré */
    getbridgeIP = () => {
        console.log("Getbridge IP ");
        const api = create({baseURL: 'https://discovery.meethue.com/'});
        api.get('/')
            .then(response => {
                if (response.data['0']) {
                    console.log('Réponse meethue:', response);
                    let bridgeIP = response.data[0].internalipaddress;
                    return bridgeIP
                } else return null
            })
            .then((IP) => {
                if (IP) {
                    console.log(IP);
                    AsyncStorage.setItem('bridgeIP', IP) //TODO: discuter pertinence (voir commentaire loadSavedData)
                        .then(() => {
                            console.log('Bridge IP enregistré, on stop le timer');
                            this.bridgeIPTimer(true); // stop loop bridgeIP
                        })
                        .catch(console.log);
                    this.gettemperatures(IP); // On (essai) récup les températures (blocage si pas d'authID
                    console.log("setStage bridgeIP: ", IP)
                    this.setState({bridgeIP: IP});
                } else {
                    console.log('Pont non trouvé')
                }
            })
            .catch((error => {
                console.log(error)
            }))
    }
    getauthID = () => {
        console.log("GetauthID ");
        if (this.state.bridgeIP) // Pour éviter de créer un objet avec URL nulle
        {
            const api = create({baseURL: `http://${this.state.bridgeIP}/api`});
            api.post('/', {
                devicetype: 'T4Hue#Hue4u'
            })
                .then((response) => {
                    if (response) {
                        console.log(JSON.stringify(response.data));
                        Object.keys(response.data[0]).map((value) => {
                            console.log("authID response.data[0]: ", value)
                            let retourauthID;
                            if (value == "success") {
                                console.log('authID success:', response.data[0].success);
                                retourauthID = response.data[0].success.username;
                                AsyncStorage.setItem('authID', retourauthID)
                                    .then(() => {
                                        console.log('AuthID enregistré, on stop le timer');
                                        this.setState({authID: retourauthID});
                                        this.gettemperatures(this.state.bridgeIP, retourauthID); // On (essai) récup les températures (blocage si pas d'IP
                                        this.authIDTimer(true); // stop loop bridgeIP
                                    })
                                    .catch(console.log);
                                console.log("setStage authID: ", retourauthID)

                            } else {
                                console.log('authID erreur:', response.data[0].error.description)
                                retourauthID = null
                            }
                            return retourauthID;
                        });
                    } else {
                        console.log('authID pas de réponse')
                        return null;
                    }
                })
                .catch((error => {
                    console.log(error)
                }))
        }

    }
    gettemperatures = (IP, authID?) => {
        if (IP && (this.state.authID || authID)) // Pour éviter de créer un objet avec URL nulle
        {
            const api = create({baseURL: `http://${IP}/api/${authID || this.state.authID}`});
            api.get('/sensors')
                .then((response) => {
                    console.log('gettempsensor:', response);
                    if (response.data) {

                        temperatures = [];
                        Object.keys(response.data).forEach((key) => {
                            // Keep only temperature sensors and get their names from sensor key +1 (associated)
                            if ((response.data[key].type == 'ZLLTemperature') && (response.data[(Number(key) + 1)])) {
                                let realName = response.data[(Number(key) + 1)].name; //On trouve le vrai nom
                               // console.log('Capteurs trouvés: ', realName);
                                response.data[key].name = realName;
                                response.data[key].state.temperature = Number(Number(response.data[key].state.temperature) / 100).toFixed(1);

                                /*
                                console.log('Température: ', response.data[key].state.temperature);
                                console.log('Time: ', response.data[key].state.lastupdated);
                                console.log('------------')*/
                                temperatures.push({
                                    Capteur: response.data[key].name,
                                    Temp: response.data[key].state.temperature
                                })

                            } else {/* on ne fait rien car on ne garde que les relevés de température*/
                            }
                        });
                        console.log('Températures', temperatures);

                        this.setState({
                            temps: temperatures,
                            isOverlayVisible: false,
                            bridgeIP: IP,
                            authID: authID || this.state.authID,
                        });
                        console.log(this.state);
                    } else {
                        console.log('Temperature: pas de réponse')
                        return null;
                    }
                })
                .catch((error => {
                    console.log(error)
                }))
        }
    }


    render() {
        //TODO: Régler les conditions dans lesquelles l'overlay s'affiche
        if (this.state.isOverlayVisible) {
            return (
                <Overlay
                    isVisible={this.state.isOverlayVisible}
                    onBackdropPress={() => this.setState({isOverlayVisible: false})}
                >
                    <View>
                        <Text style={{color: "black", textDecorationStyle: "solid"}} tx="mainScreen.overlaytitle"/>
                        <Divider style={{backgroundColor: 'blue'}}/>
                        
                            <View>
                                <Button ViewComponent={LinearGradient} // Don't forget this!
                                        linearGradientProps={{
                                            colors: this.state.bridgeIP === (null || "") ? ['red', 'pink'] : ['green', 'green'],
                                            start: {x: 0, y: 0.5},
                                            end: {x: 1, y: 0.5},
                                        }}
                                        title="Réussie!"
                                        titleStyle={{color: 'black'}}
                                        type="clear"
                                        loading={this.state.bridgeIP === (null || "")}
                                        icon={
                                            <Icon name="check"/>}
                                />
                                <Text style={{color: "black"}}
                                      text={this.state.bridgeIP === (null || "") ? "Pas de pont trouvé pour le moment..." : this.state.bridgeIP}/>
                                <Text style={{color: "black"}}
                                      tx={this.state.bridgeIP === (null || "") ? "mainScreen.overlaytextconnect" : ""}/>
                            </View>
                        
                        
                            <View>
                                <Button ViewComponent={LinearGradient} // Don't forget this!
                                        linearGradientProps={{
                                            colors: this.state.authID === (null || '') ? ['red', 'pink'] : ['green', 'green'],
                                            start: {x: 0, y: 0.5},
                                            end: {x: 1, y: 0.5},
                                        }}
                                        title="Réussie!"
                                        titleStyle={{color: 'black'}}
                                        type="clear"
                                        loading={this.state.authID === (null || '')}
                                        icon={
                                            <Icon name="check"/>}
                                />
                                {   /*  <Text style={{color:"black"}} text={this.state.authID=== (null|| "") ? "Pas d'authid": this.state.authID}/>*/}
                                <Text style={{color: "black"}}
                                      tx={this.state.authID !== (null || '') ? "" : "mainScreen.overlaytextauth"}/>
                            </View>
                        
                    </View>
                </Overlay>
            )
        }
        else {
            return (
               // <TabBar tabSelected={this.state.tabSelected}
             //           style={{flex:1,height:this.state.height, width:this.state.width}}>{/* TODO: placer ici le passage du changement de taille?*/}
             //     <TabBar.Item
             //       icon={require('./tab1.png')}
             //       selectedIcon={require('./tab1.png')}
             //       title="Tab1"
             //       screenBackgroundColor={{backgroundColor: '#E6E4E4'}}
             //     >
             //         {/*Début TAB 1*/}
                   <ScrollView style={MAINVIEW}>
                        
                       <Card containerStyle={CARDCONTAINER}>
                           <View style={{flexDirection:"row",alignSelf:"center"}}>
                            <Card.Title style={{color:palette.offWhite}}>
                               <Text style={{fontSize:19}}> Températures </Text>
                           </Card.Title>
                           <Icon name='home-outline'
                             type='ionicon'
                             color='#517fa4'/>   
                           </View>
                           
                           <FlatList data={temperatures}
                        style={{backgroundColor:palette.black}}
                                  renderItem={({item}) => <BadgeTemp temperature={item.Temp}
                                                                     room={item.Capteur}
                                                                     onPress={()=>{this.navigateTab(1)}}/>
                                  }
                                  keyExtractor={(item) => item.Capteur.toString()}
                        />
                       </Card>
                   </ScrollView>
               //   </TabBar.Item>
               //   <TabBar.Item
               //     icon={require('./tab2.png')}
               //     selectedIcon={require('./tab2.png')}
               //     title="Tab2"
              //      screenBackgroundColor={{backgroundColor: '#E6E4E4'}}
              //    >
              //      <ScrollView style={MAINVIEW}>
               //       <Text text="Hey!" style={IP}/>
              //          {/*Page Content*/}
                 //   </ScrollView>
//
               //   </TabBar.Item>
               //   <TabBar.Item
              //      icon={require('./tab3.png')}
              //      selectedIcon={require('./tab3.png')}
              //      title="Tab3"
              //      screenBackgroundColor={{backgroundColor: '#E6E4E4'}}>
              //      <ScrollView style={MAINVIEW}>
               //         {/*Page3 Content*/}
                //      <View>
              //          <Button title={i18n.t('configScreen.clearall')}
               //                 onPress={() => {
                //                    AsyncStorage.clear();
               //                     console.log("Storage cleared");
             //                   }}
                //        />
                 //     </View>
                //    </ScrollView>
                //  </TabBar.Item>
              //  </TabBar>
            )
        }
    }
}

/*
export interface IGetAuth {
    error?: {
        type: number;
        address: string;
        description: string;
    };
    success?: {
        username: string;
    };
}*/

// Interface pour les capteurs
export interface iGetSensor {
    state: SensorState;
    swupdate: SensorSwupdate;
    config: Sensorconfig;
    name: string;
    type: string;
    modelid: string;
    manufacturername: string;
    productname: string;
    swversion: string;
    uniqueid: string;
    capabilities: SensorTempCapabilities;
}

export interface SensorState {
    temperature: number;
    lastupdated: string;
}

export interface SensorSwupdate {
    state: string;
    lastinstall: null;
}

export interface Sensorconfig {
    on: boolean;
    battery: number;
    reachable: boolean;
    alert: string;
    ledindication: boolean;
    usertest: boolean;
    pending: Array<any>;
}


export interface SensorTempCapabilities {
    certified: boolean;
}
