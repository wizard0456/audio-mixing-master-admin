import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL, LOADING_STATUS } from "../utilities/constants";
import axios from "axios";
import { toast, Slide } from "react-toastify";

const initialState = {
    customers: [],
    customer: {},
    error: '',
    status: LOADING_STATUS.IDLE // Add this line to define the 'status' property
}

export const fetchCustomer = createAsyncThunk('customer/fetchCustomer', async (id) => {
    try {
        const response = await axios.get(API_URL + 'customers/' + id);
        return response.data;
    } catch (error) {
        console.log(error);
    }
});

export const fetchAllCustomers = createAsyncThunk('customer/fetchAllCustomers', async ({ _order, _sort }) => {
    try {
        let API_ENDPOINT;
        if (_order && _sort) {
            API_ENDPOINT = (`${API_URL}customers/?_order=${_order}&_sort=${_sort}`);
        } else {
            API_ENDPOINT = `${API_URL}customers/`;
        }

        const response = await axios.get(API_ENDPOINT);
        return response.data;
    } catch (error) {
        console.log(error);
    }
});

export const registerCustomer = createAsyncThunk('customer/registerCustomer', async (customerData) => {
    try {
        const response = await axios.post(API_URL + 'customers', customerData);
        return response.data;
    } catch (error) {
        console.log(error);
    }
});

export const updateCustomer = createAsyncThunk('customer/updateCustomer', async ({ id, formData }) => {
    try {
        const response = await axios.put(API_URL + 'customers/' + id, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        console.log(error);
    }
});

export const deleteCustomer = createAsyncThunk('customer/deleteCustomer', async (id, { rejectWithValue }) => {
    try {
        const response = await axios.delete(API_URL + 'customers/' + id);
        return response.data;
    } catch (error) {
        console.log(error);
        rejectWithValue(error);
    }
});

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1
        },
        resetCustomerField: (state) => {
            state.customer = {};
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomer.fulfilled, (state, { payload }) => {
                state.customer = payload.data;
            })
            .addCase(fetchAllCustomers.fulfilled, (state, { payload }) => {
                state.status = LOADING_STATUS.SUCCEEDED;
                state.customers = payload.data;
            })
            .addCase(registerCustomer.fulfilled, (state, { payload }) => {
                state.status = LOADING_STATUS.SUCCEEDED;
                if (payload && payload.data) {
                    state.customers.push(payload.data);
                    toast.success('Customer registered successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        progress: undefined,
                        theme: "light",
                        transition: Slide,
                    });
                }
            })
            .addCase(registerCustomer.rejected, (state) => {
                state.status = LOADING_STATUS.FAILED;
                toast.error('Failed to register customer!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });
            })
            .addCase(updateCustomer.fulfilled, (state, { payload }) => {
                state.status = LOADING_STATUS.SUCCEEDED;
                state.customers = state.customers.map((customer) => {
                    if (customer.id === payload.data.id) {
                        return payload.data;
                    }
                    return customer;
                });
                toast.success('Customer updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });
            })
            .addCase(updateCustomer.rejected, (state) => {
                state.status = LOADING_STATUS.FAILED;
                toast.error('Failed to update customer!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined,
                    theme: "light",
                    transition: Slide,
                });
            })
            .addCase(deleteCustomer.fulfilled, (state, { payload }) => {
                state.status = LOADING_STATUS.SUCCEEDED;
                if (payload && payload.data) {
                    state.customers = state.customers.filter((customer) => customer.id !== payload.data.id);
                    toast.success('Customer deleted successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        progress: undefined,
                        theme: "light",
                        transition: Slide,
                    });
                }
            });
    }
})



export const getCustomer = (state) => state.customer;

export const { increment, resetCustomerField } = customerSlice.actions;
export default customerSlice.reducer;