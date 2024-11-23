import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Pagination,
  Box
} from '@mui/material';

const HomePage = () => {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    price: [0, 1000],
    page: 1,
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/packages', {
          params: {
            page: filters.page,
            ...(filters.category && { category: filters.category }),
            'price[gte]': filters.price[0],
            'price[lte]': filters.price[1],
          },
        });
        setPackages(data.packages);
      } catch (error) {
        console.error('Error fetching packages:', error.response?.data || error.message);
      }
    };

    fetchPackages();
  }, [filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/categories');
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (event) => {
    setFilters({ ...filters, category: event.target.value });
  };

  const handlePriceChange = (event, newValue) => {
    setFilters({ ...filters, price: newValue });
  };

  const handlePageChange = (event, value) => {
    setFilters({ ...filters, page: value });
  };

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select value={filters.category} label="Category" onChange={handleCategoryChange}>
            <MenuItem value="">All</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ width: 300 }}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={filters.price}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `$${value}`}
            min={0}
            max={1000}
            step={50}
            sx={{
              color: '#1976d2',
              '& .MuiSlider-thumb': {
                backgroundColor: '#1976d2'
              }
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={3} key={pkg._id}>
            <Card sx={{ borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
              {pkg.images && pkg.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="140"
                  image={pkg.images[0].url} // Display the first image of the package
                  alt={pkg.name}
                  sx={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
                />
              )}
              <CardContent sx={{ padding: '16px' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {pkg.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pkg.description}
                </Typography>
                <Typography variant="h6" sx={{ color: '#1976d2', mb: 2 }}>
                  {`$${pkg.price}`}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => addToCart(pkg)}
                  sx={{
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#155a9c'
                    }
                  }}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Pagination
          count={Math.ceil(packages.length / 4)}
          page={filters.page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

const addToCart = (pkg) => {
  console.log('Adding to cart:', pkg);
};

export default HomePage;
