import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard"
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import * as url from "url";

const Products = () => {
    const { enqueueSnackbar } = useSnackbar();
    const isLoggedIn = localStorage.getItem("username") || false
    const token = localStorage.getItem("token")
    const [productList, updateProductList] = useState([]);
    const [searchKey, updateSearchKey] = useState("");
    const [apiProgress, updateApiProgress] = useState(false);
    const [timerId, setTimerId] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cartItemsOnLoad, setCartItemsOnLoad] = useState([]);
    const [currentCartItems, updateCurrentCartItems] = useState([]);

    const getProductGrid = (handleAddToCart) => {
      let productGrid = <Grid></Grid>
        if(apiProgress){
            return <Grid container
            spacing={0}
            alignItems="center"
            justifyContent="center">
                <CircularProgress></CircularProgress>
                <p>Loading Products</p>
                </Grid>
        }
        if(filteredProducts.length > 0){
            
          productGrid = filteredProducts.map(product => (
            <Grid item xs={12} sm={6} md={3} key={product._id}>
                <ProductCard handleAddToCart={handleAddToCart} product={product}/>
            </Grid>
            ))

        }
        else{
          productGrid = <Grid container
          spacing={0}
          alignItems="center"
          justifyContent="center">
          <SentimentDissatisfied>
          </SentimentDissatisfied>
          <p>No products found</p>
          </Grid>
        }
      return productGrid
    }

    const performAPICall = async () => {
        updateApiProgress(true)
        const response = await axios.get(`${config.endpoint}/products`)
        .then(response => {
            updateProductList(response.data)
            setFilteredProducts(response.data)
            updateApiProgress(false)
            return response.data})
        .catch(error => {
            if(error.response.status === 404){
                //console.log("no products");
                setFilteredProducts([])
                updateApiProgress(false)
            }
        })
        
    }

    const performSearch = async () => {

          updateApiProgress(true)
          let url = `${config.endpoint}/products/search?value=${searchKey}`
          //console.log("searchKey", searchKey, url)
          
          const searcheResult = await axios.get(url)
          .then(response => {
            //console.log("search", response.data)
            setFilteredProducts(response.data)
            updateApiProgress(false)
            return response.data})
          .catch(error => {
            //console.log(error)
            if(error.response.status === 404){
                  //qconsole.log("no products");
                  setFilteredProducts([])
                  updateApiProgress(false)
            }
          })
        
    }

    /**
     * Perform the API call to fetch the user's cart and return the response
     *
     * @param {string} token - Authentication token returned on login
     *
     * @returns { Array.<{ productId: string, qty: number }> | null }
     *    The response JSON object
     *
     * Example for successful response from backend:
     * HTTP 200
     * [
     *      {
     *          "productId": "KCRwjF7lN97HnEaY",
     *          "qty": 3
     *      },
     *      {
     *          "productId": "BW0jAAeDJmlZCF8i",
     *          "qty": 1
     *      }
     * ]
     *
     * Example for failed response from backend:
     * HTTP 401
     * {
     *      "success": false,
     *      "message": "Protected route, Oauth2 Bearer token not found"
     * }
     */
    const fetchCart = async (token) => {
        if (!token) return;
        //console.log("token", token)
        const axiosHeaders = {
            'Authorization': 'Bearer ' + token
        }
        try {
            //: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
            const res = await axios.get(`${config.endpoint}/cart`, {
                headers: axiosHeaders
            });

            //console.log(res.data)
            setCartItemsOnLoad(res.data)
            updateCurrentCartItems(res.data)

            return res.data

        } catch (e) {
            if (e.response && e.response.status === 400) {
                enqueueSnackbar(e.response.data.message, { variant: "error" });
            } else {
                enqueueSnackbar(
                    "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
                    {
                        variant: "error",
                    }
                );
            }
            return null;
        }
    };


    // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
    /**
     * Return if a product already is present in the cart
     *
     * @param { Array.<{ productId: String, quantity: Number }> } items
     *    Array of objects with productId and quantity of products in cart
     * @param { String } productId
     *    Id of a product to be checked
     *
     * @returns { Boolean }
     *    Whether a product of given "productId" exists in the "items" array
     *
     */
    const isItemInCart = (items, productId) => {
        const itemsInCart = items.filter(item => item.productId === productId)
        return itemsInCart.length > 0;
    };

    /**
     * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
     *
     * @param {string} token
     *    Authentication token returned on login
     * @param { Array.<{ productId: String, quantity: Number }> } items
     *    Array of objects with productId and quantity of products in cart
     * @param { Array.<Product> } products
     *    Array of objects with complete data on all available products
     * @param {string} productId
     *    ID of the product that is to be added or updated in cart
     * @param {number} qty
     *    How many of the product should be in the cart
     * @param {boolean} options
     *    If this function was triggered from the product card's "Add to Cart" button
     *
     * Example for successful response from backend:
     * HTTP 200
     * {
     *      "success": true
     * }
     *
     * Example for failed response from backend:
     * HTTP 404
     * {
     *      "success": false,
     *      "message": "Product doesn't exist"
     * }
     */
    const addToCart = async (
        token,
        items,
        products,
        productId,
        qty,
        options = { preventDuplicate: false }
    ) => {
        if(options.preventDuplicate) {
            if(isItemInCart(items, productId)){
                enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", {variant : "warning"})
                return null;
            }
        }

        var data = JSON.stringify({
            "productId": productId,
            "qty": qty
        });

        var axiosConfig = {
            method: 'post',
            url: config.endpoint +"/cart",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data : data
        };

        axios(axiosConfig)
            .then(function (response) {
                if(options.delete){
                    enqueueSnackbar("Product removed from cart", {variant:"success"})
                }
                else if (options.fromProducts){
                    enqueueSnackbar("Product added to cart", {variant:"success"})
                }
                else {
                    enqueueSnackbar("Product quantity updated", {variant:"success"})
                }
                updateCurrentCartItems(response.data)
            })
            .catch(function (error) {
                console.log(error);
            });



    };

    const handleAddToCart = (productId) =>{
        addToCart(token, currentCartItems, productList, productId,1, {fromProducts: true, preventDuplicate: true} )
    }

    const handleQuantity = (productId, quantity) => {
        //console.log("handle quantity", productId, quantity)
        let options = {preventDuplicate: false}
        if (quantity === 0){
            options = {...options, ["delete"]:true}
        }
        addToCart(token, currentCartItems, productList, productId,quantity, options)
    }

    const getCart = () => {
        if(isLoggedIn){

            return (
                <Grid bgcolor="#E9F5E1" item md={3}>
                    <Cart  handleQuantity={handleQuantity} products={productList} items={currentCartItems} />
                </Grid>)
        }
        else{
            <Grid></Grid>
        }
    }

    useEffect(() => {
        performAPICall()
        fetchCart(token)
    }, [])

    useEffect(()=>{
      if(!searchKey) {
          setFilteredProducts(productList)
      }
      else{
        if(timerId){
            clearTimeout(timerId)
        }
        const debounceTimerId = setTimeout(()=> performSearch(),500)
        setTimerId(debounceTimerId)
      }
    }, [searchKey])





  return (
    <div>
      <Header
       searchBox={
          <TextField
          value={searchKey}
          onChange={(event) => updateSearchKey(event.target.value)}
          className="search-desktop"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
        />
      }
      />

      <TextField
        value={searchKey}
        onChange={(event) => updateSearchKey(event.target.value)}
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
        <Grid container direction="row">
            <Grid item md>
                <Grid >
                    <Box className="hero">
                        <p className="hero-heading">
                            India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                            to your door step
                        </p>
                    </Box>

                </Grid>
                <Grid container className="product-grid"> {getProductGrid(handleAddToCart)} </Grid>
                {/* <Grid container className="product-grid"> {getProductGrid()} </Grid> */}

            </Grid>
            {getCart()}
        </Grid>
      <Footer />
    </div>
  );
};

export default Products;
