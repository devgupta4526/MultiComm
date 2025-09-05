import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
    withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

//Handle logout and prevent infinite loops
const handleLogout = () => {
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}


//Handle adding the refresh token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
}


//Execute all queued requests after token refresh
const onRefreshSuccess = () => {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
}

//Handling the api request 
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => {
        return Promise.reject(error);
    }
);

//Handle the expired token and refresh logic
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(() => {
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            isRefreshing = true;
            originalRequest._retry = true;

            try {
                await axiosInstance.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                isRefreshing = false;
                onRefreshSuccess();

                return axiosInstance(originalRequest);

            } catch (err) {
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


export default axiosInstance;

