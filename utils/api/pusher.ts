import utils from "../utils";

const pusher = {
  auth: (socket_id: string, channel_name: string) => {
    return utils.api_request({
      url: "api/pusher/auth",
      method: "POST",
      data: {
        socket_id,
        channel_name,
      },
    });
  },
};

export default pusher;
