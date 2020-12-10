import { createStackNavigator } from "react-navigation"
import { MainScreen } from "../screens/Main-screen"
import { ExampleNavigator } from "./example-navigator"

export const RootNavigator = createStackNavigator(
  {
    mainScreen: { screen: MainScreen },
    exampleStack: { screen: ExampleNavigator },
  },
  {
    headerMode: "none",
    navigationOptions: { gesturesEnabled: false },
  },
)
