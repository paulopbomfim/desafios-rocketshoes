import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product: Product) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    priceFormatted: formatPrice(product.price),
    image: product.image,
    amount: product.amount,
  }));

  const total =
    formatPrice(
      cart.reduce((sumTotal: number, product: Product) => {
        return sumTotal += (product.price * product.amount);
      }, 0)
    );

  function handleProductIncrement(product: Product) {
    const amount = product.amount + 1;
    const productId = product.id;
    updateProductAmount({productId, amount});
  }

  function handleProductDecrement(product: Product) {
    const amount = product.amount - 1;
    const productId = product.id;
    updateProductAmount({productId, amount});
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
         {
            cartFormatted.map((cartItem) => (
              <tr data-testid="product" key={ cartItem.id }>
                <td>
                  <img src={ cartItem.image } alt={ cartItem.title } />
                </td>
                <td>
                  <strong>{ cartItem.title }</strong>
                  <span>{ cartItem.priceFormatted }</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={cartItem.amount <= 1}
                      onClick={() => handleProductDecrement(cartItem)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={ cartItem.amount }
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                    onClick={() => handleProductIncrement(cartItem)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{ formatPrice(cartItem.price * cartItem.amount) }</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(cartItem.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))
         }
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{ total }</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
