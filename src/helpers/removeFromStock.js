const removeFromStock = async (order, model) => {
  for (let index = 0; index < order.items.length; index++) {
    let orderItem = order.items[index];
    const updatedWallet = await model.findByIdAndUpdate(
      orderItem.productWallet_id,
      {
        $push: {
          transactions: {
            quantity: -orderItem.quantity,
            order_id: order._id
          }
        }
      },
      { lean: true, new: true }
    );
  }
  return true;
};

export default removeFromStock;
