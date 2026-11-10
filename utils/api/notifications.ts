import utils from "../utils";

const notificationsApi = {
  get_notifications: () => {
    return utils.api_request({
      url: "api/notifications",
      method: "GET",
    });
  },
  mark_read: (id: string) => {
    return utils.api_request({
      url: `api/notifications/${id}/read`,
      method: "POST",
    });
  },
};

export default notificationsApi;
