import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";

export const config = {
  endpoint: `http://qkart-frontendbhoomireddybhanu.herokuapp.com/api/v1`,
};

function App() {
  return (
    <div className="App">
      <Switch>
          
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          
          <Route exact path="/">
            <Products />
          </Route>
          
        </Switch>
    </div>
  );
}

export default App;
