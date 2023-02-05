import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {

  return (
    <Card className="card">
      <CardMedia
        component="img"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
          <Typography color="black" variant="subtitle1">
            {product.name}
          </Typography>
          <Typography color="black" fontWeight="bold" variant="h5">
            ${product.cost}
          </Typography>
          <Rating name="half-rating-read" defaultValue={product.rating} precision={0.5} readOnly />
        </CardContent>
       <CardActions>
        <Button onClick={() => handleAddToCart(product._id)} name="add to cart" role="button" variant="contained" fullWidth>ADD TO CART</Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
