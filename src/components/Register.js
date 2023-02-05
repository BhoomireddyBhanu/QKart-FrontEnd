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
import "./Register.css";

const Register = () => {
  
  const [formData, updateFormData] = useState({username: "", password: "", confirmPassword: ""});
  const {apiProgress, updateApiProgress} = useState("finished")
  const history = useHistory();

  const { enqueueSnackbar } = useSnackbar()
  

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 200
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {
    //console.log("register", formData)
    const isValidInput = validateInput(formData)
    if (!isValidInput) {
      return false
    }
    const {username, password, confirmPassword} = formData

    //console.log("isValidInput", isValidInput)
    try {

      //updateApiProgress("progress")
      const response = await axios.post(`${config.endpoint}/auth/register`, {"username": username, password: password})
      .then(response => response.data).catch((error) =>  {return {sucess: false, "error": error.message}});
      
      //updateApiProgress("finished")
      if (response.success){
        enqueueSnackbar("Registered Successfully", {variant: "success"})
        
        history.push("/login", { from: "Register" })

      }
      else if (response.error.includes("400")){
        enqueueSnackbar("Username is already taken", {variant: "error"})
      }
    }
    catch(error){
      enqueueSnackbar("backend is not started", {variant: "error"})
    }
  
   
    
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
      const {username, password, confirmPassword} = data

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

      if (username.length < 6){
        enqueueSnackbar("Username must be at least 6 characters", { 
          variant: 'error',
      })
        return false
      }
      if (password.length < 6){
        enqueueSnackbar("Password must be at least 6 characters", { 
          variant: 'error',
      })
        return false
      }
      if ( password !== confirmPassword){
        enqueueSnackbar("Passwords do not match", { 
          variant: 'error',
      })
        return false
      }
    return true
  };

  const formDataHandler = (event) => {  
    const [key, value] = [event.target.name, event.target.value]
    updateFormData({...formData, [key]: value})
  }
  let regButton = <div></div>
  if (apiProgress === "progress"){
    regButton =  <CircularProgress />
  
  }
  else{
    regButton = <Button onClick={() => register(formData)} type="submit" className="button" variant="contained">
    Register Now
  </Button>
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
          <h2 className="title">Register</h2>
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
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={formDataHandler}
            type="password"
            fullWidth
          />
         {regButton}
        
          <p className="secondary-action">
            Already have an account?{" "}
            <Link to="/login">Login here</Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
