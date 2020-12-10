import { createStackNavigator } from "react-navigation"
import { FirstExampleScreen } from "../screens/first-example-screen"
import { SecondExampleScreen } from "../screens/second-example-screen"
import {MainScreen} from "../screens/Main-screen"
export const ExampleNavigator = createStackNavigator({
  mainScreen:{screen: MainScreen},
  firstExample: { screen: FirstExampleScreen },
  secondExample: { screen: SecondExampleScreen },
},
{
  headerMode: "none",
})
