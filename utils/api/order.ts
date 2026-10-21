import utils from "../utils";

const order = {
    create_order: (order_data: any) => {
        return utils.api_request({
            url: 'api/order/create_order',
            method: 'POST',
            data: order_data,
        });
    },
};

export default order;