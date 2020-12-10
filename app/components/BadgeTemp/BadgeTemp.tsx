import * as React from "react"
import { View, ViewStyle } from "react-native"
// import { Text } from "../text"
import {Avatar, ListItem,Text} from "react-native-elements";

import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import { palette } from "../../theme/palette";
import { color } from "../../theme";
import { TouchableHighlight } from "react-native";

export interface BadgeTempProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: string

  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string

  /**
   * An optional style override useful for padding & margin.
   */
  style?: ViewStyle
  /**
   * Text which is looked up via i18n.
   */
  room?: string
  /**
   * Text which is looked up via i18n.
   */
  temperature?:number

    onPress?: ()=>void
}

/**
 * Stateless functional component for your needs
 *
 * Component description here for TypeScript tips.
 */
export function BadgeTemp(props: BadgeTempProps) {
  // grab the props
  const { tx, text, style, room,temperature, onPress, ...rest } = props
  const textStyle = { }

  return (
    
    <ListItem Component={TouchableHighlight}
    containerStyle={{backgroundColor:"#1d1d1d", marginBottom:5, borderRadius:15}}>
<Avatar 
      icon={{name: 'thermometer-outline', type: 'ionicon',size:35,color:temperature<19?palette.cold:palette.orange}}
          avatarStyle={{tintColor:palette.cold}}
          />      
  <ListItem.Content >
  <ListItem.Title><Text style={{color:palette.white}}>{room}</Text></ListItem.Title>
  <ListItem.Subtitle><Text style={{color:palette.white,fontWeight: 'bold'}}>{temperature==0?"Pas relié":temperature+'°C'}</Text></ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
    
   /*       Component={TouchableScale}
          containerStyle={{
            borderRadius:5,
              marginBottom:5,
              marginTop:10,
              alignSelf:"center"
          }}
          friction={90} //
          tension={100} // These props are passed to the parent component (here TouchableScale)
          activeScale={0.95} //
          linearGradientProps={{
            colors: [ '#000000','#1d1d1d'],
            start: {x:1,y:0},
            end: {x:0.2,y: 0},
          }}
          ViewComponent={LinearGradient} // Only if no expo
          leftAvatar={{ rounded: true, source:  require('../../screens/Main-screen/tab1.png'),
            avatarStyle:{backgroundColor:palette.black,tintColor:palette.cold, resizeMode:"cover"}
          }}
          
          chevronColor="white"
          chevron
          onPress={onPress}
      />*/
  )
}
/*    <View style={style} {...rest}>
      <Text tx={tx} text={text} style={textStyle} />
    </View>

   */
