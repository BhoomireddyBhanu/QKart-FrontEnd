import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { Avatar, Button, Stack,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import {useHistory} from "react-router-dom";
import "./Header.css";

const Header = (props) =>
  {
    const history = useHistory();
    const logout = () => {
      localStorage.removeItem("username")
      localStorage.removeItem("token")
      localStorage.removeItem("balance")
      history.push("/")
      window.location.reload()
    }

    const username = localStorage.getItem("username")

    let searchBox = <Box></Box>
    
    if (!props.hasHiddenAuthButtons){
      searchBox = props.searchBox
    }

    let headerButton = <Button></Button>;

    if (props.hasHiddenAuthButtons){
      headerButton = <Button onClick={()=>{history.push("/", {})}}
        name="back to explore"
        startIcon={<ArrowBackIcon />}
        variant="text"
        >
        Back to explore
      </Button>
    }
    else if (username){
      headerButton = <Stack direction="row" spacing={1} alignItems="center">
        <Avatar alt={username} src="avatar.png" />
        <p>{username}</p>
        {/* <p>{username.charAt(0).toUpperCase() + username.slice(1)}</p> */}
        <Button onClick={logout} variant="text">LOGOUT</Button>
      </Stack>
    }
    else {
      headerButton = <Stack direction="row" spacing={1} alignItems="center">
        <Button onClick={()=>{history.push("/login", {})}}  variant="text">LOGIN</Button>
        <Button onClick={()=>{history.push("/register", {})}} variant="contained">REGISTER</Button>
      </Stack>
    }

   

    return (
      <Box className="header">
        <Box
          className="header-title"
        >
          {/* FIXME - Skip svg in stub generator */}
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {searchBox}
        {headerButton}
      </Box>
    );
  };

export default Header;
