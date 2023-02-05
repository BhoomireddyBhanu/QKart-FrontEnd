import {Link} from "react-router-dom"
import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
// import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, updateFormData] = useState({username: "", password: ""});
  const history = useHistory();
    // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the API call over the network and return the response
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   */
   const login = async (formData) => {
    const isValidInput = validateInput(formData)
    if (!isValidInput) {
      return false
    } 
    const {username, password} = formData

    //console.log("isValidInput", isValidInput)
    try {

      //updateApiProgress("progress")
      const response = await axios.post(`${config.endpoint}/auth/login`, {"username": username, password: password})
      .then(response => response.data).catch((error) => error.response.data);
      //console.log(response)
      //updateApiProgress("finished")
      if (response.success){
        enqueueSnackbar("Logged In Successfully", {variant: "success"})
        
        persistLogin(response.token, response.username,response.balance)
        history.push("/", { from: "Login" })

      }
      else if (!response.success){
        if (response.message.includes("Password")){
          enqueueSnackbar("password is incorrect", {variant: "error"})
        }
        else if (response.message.includes("Username"))
        enqueueSnackbar("login with incorrect username", {variant: "error"})
      }
    }
    catch(error){
      enqueueSnackbar("backend is not started", {variant: "error"})
    }
  
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    const {username, password} = data

      if (username === ""){
        enqueueSnackbar("Username is a required field", { 
          variant: 'error',
      })
        return false
      }
      if (password === ""){
        enqueueSnackbar("Password is a required field", { 
          variant: 'error',
      })
        return false
      }
    return true
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('balance', balance);

  };

  const formDataHandler = (event) => {  
    const [key, value] = [event.target.name, event.target.value]
    updateFormData({...formData, [key]: value})
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
        <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            value={formData.username}
            onChange={formDataHandler}
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            value={formData.password}
            onChange={formDataHandler}
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
          />
         <Button onClick={()=>{login(formData)}} type="submit" className="button" variant="contained">
          LOGIN TO QKART
          </Button>
          <p className="secondary-action">
          Don’t have an account?{" "}
            <Link to="/register">Register Now</Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
