import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const shoppingCart = [...cart];
      const productExists = shoppingCart.find(({id}) => id === productId);

      const inStockProduct = await api.get(`/stock/${productId}`)
      const stockAmount = inStockProduct.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      } 

      if (productExists) {
        productExists.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1,
        };

        shoppingCart.push(newProduct);
      }

      setCart(shoppingCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(shoppingCart));
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const allCartItems = [...cart];

      if (!allCartItems.some(({id}) => id === productId)) {
        throw new Error();
      }

      const updatedCart = allCartItems.filter(({id}) => id !== productId);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const allCartItems = [...cart];
      const productsInStock = await api.get(`/stock/${productId}`);
      const amountOfProducts = productsInStock.data.amount;

      if (amount > amountOfProducts) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (amount < 1) {
        return;
      }

      const itemUpdated = allCartItems.find(({id}) => id === productId);
      if (!itemUpdated) {
        throw new Error();
      }

      itemUpdated.amount = amount;
      
      setCart(allCartItems);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(allCartItems));

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
