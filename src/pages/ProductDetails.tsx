import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const ProductDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
      
      return data;
    },
  });

  const addToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    // Get existing cart from localStorage or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Add new item to cart
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image_url: product.image_url,
      quantity: 1
    };
    
    existingCart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(existingCart));
    
    toast({
      title: "Added to cart",
      description: `${product.name} - Size ${selectedSize} added to your cart`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg overflow-hidden bg-white shadow-lg">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-[500px] object-cover object-center"
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">{product.brand}</p>
            <p className="text-4xl font-bold text-gray-900">${product.price}</p>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select Size</h2>
              <div className="grid grid-cols-4 gap-2">
                {product.size.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className="w-full"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={addToCart}
              className="w-full py-6 text-lg"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;