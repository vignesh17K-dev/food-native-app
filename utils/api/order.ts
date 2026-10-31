import utils from "../utils";

const order = {
    create_order: (order_data: any) => {
        return utils.api_request({
            url: 'api/order/create_order',
            method: 'POST',
            data: order_data,
        });
    },
    verify_order: (data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) => {
        return utils.api_request({
            url: 'api/order/verify_order',
            method: 'POST',
            data: {
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
            },
        });
    },

    get_orders: () => {
        return utils.api_request({
            url: 'api/order/get_orders',
            method: 'GET',
        });
    },

    get_order: (order_id: string) => {
        return utils.api_request({
            url: `api/order/get_order/${order_id}`,
            method: 'GET',
        });
    },
};

export default order;