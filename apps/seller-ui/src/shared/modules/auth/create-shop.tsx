import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/app/utils/shopCategories';
import axios, { AxiosError } from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form';


type FormData = {
  name: string;
  bio: string;
  address: string;
  website?: string;
  category: string;
  sellerId: string;
}

const CreateShop = (
  {
    sellerId,
    setActiveStep,
  }: {
    sellerId: string;
    setActiveStep: (step: number) => void;
  }
) => {
  console.log('Seller ID:', sellerId);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log('Creating shop with data:', data);
      console.log('Seller ID:', sellerId);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data);
        console.log(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`, data);
        console.log('Shop created successfully:', response.data);
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3); // Move to next step on success
    },
    onError: (error) => {
      console.error('Error creating shop:', error);
    }
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };



const countWords = (text: string): number => {
  return text.trim().split(/\s+/).length; 
}


  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className='text-2xl font-semibold mb-4'>
          Setup new shop
        </h3>
        {/* shop name        */}
        <label htmlFor="name" className="block text-gray-700 mb-1">Shop Name</label>
        <input
          id="name"
          type="text"
          placeholder="e.g. Gupta Electronics"
          className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
          {...register("name", {
            required: "Shop name is required",
            minLength: { value: 3, message: "Shop name must be at least 3 characters" }
          })}
        />
        {errors.name && (
          <p className="text-red-500">{String(errors.name.message)}</p>
        )}

        {/* Shop Bio */}
        <label htmlFor="bio" className="block text-gray-700 mb-1">Shop Bio</label>
        <textarea
          id="bio"
          placeholder="e.g. We sell the best electronics in town"
          className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
          {...register("bio", {
            required: "Shop bio is required",
            minLength: { value: 10, message: "Shop bio must be at least 10 characters" },
            validate: (value) => 
              countWords(value) <= 100 || "Shop bio must be 100 words or less",
          })}
        />
        {errors.bio && (
          <p className="text-red-500">{String(errors.bio.message)}</p>
        )}

        {/* Shop Address */}
        <label htmlFor="address" className="block text-gray-700 mb-1">Shop Address</label>
        <input  
          id="address"
          type="text"
          placeholder="e.g. 123 Main St, City, Country"
          className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
          {...register("address", {
            required: "Shop address is required",
            minLength: { value: 10, message: "Shop address must be at least 10 characters" }
          })}
        />
        {errors.address && (
          <p className="text-red-500">{String(errors.address.message)}</p>
        )}
        {/* Website */}
        <label htmlFor="website" className="block text-gray-700 mb-1">Website (optional)</label>
        <input
          id="website"
          type="url"
          placeholder="e.g. https://www.yourshop.com"
          className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
          {...register("website",{
            pattern : {
              value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]+)?(\/.*)?$/,
              message: "Please enter a valid URL"   
          }
        })}
        />
        {errors.website && (
          <p className="text-red-500">{String(errors.website.message)}</p>
        )}
        {/* Category */}
        <label htmlFor="category" className="block text-gray-700 mb-1">Category</label>
        <select
          id="category"
          className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
          {...register("category", {
            required: "Category is required",
          })}
        >
          <option value="">Select a category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500">{String(errors.category.message)}</p>
        )}
        <button
          type="submit"
           className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg"
          disabled={shopCreateMutation.isPending}
        >
          {shopCreateMutation.isPending ? 'Creating Shop...' : 'Create Shop'}
        </button>
        {shopCreateMutation.isError && (
          <p className="text-red-500 mt-2">
            Error creating shop: {String(shopCreateMutation.error)}
          </p>
        )}
      </form>
    </div>
  )
}

export default CreateShop;
