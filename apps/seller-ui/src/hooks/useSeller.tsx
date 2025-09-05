import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";


const fetchSeller = async () => {
    const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/logged-in-seller`);
    return response.data.seller;
}


const useSeller = () => {
    const {
        data: seller,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['seller'],
        queryFn: fetchSeller,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    return { seller, isLoading, isError, refetch };
}


export default useSeller;