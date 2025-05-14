const BaseController = require("./BaseController");

class AccountController extends BaseController {
  async getAuthToken(userName, password) {
    const response = await this.axiosInstance.post("/Account/v1/GenerateToken", {
      userName: userName,
      password: password,
    });
    return response.data.token;
  }

  async getUser(userID, token) {
    return await this.axiosInstance.get(`/Account/v1/User/${userID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUserId(userName, password) {
    const response = await this.axiosInstance.post("/Account/v1/Login", {
      userName: userName,
      password: password,
    });
    return response.data.userId;
  }

  async createUser(userName, password) {
    const response = await this.axiosInstance.post("/Account/v1/User", {
      userName: userName,
      password: password,
    });
    return response;
  }

  async deleteUser(userId, token) {
    return await this.axiosInstance.delete(`/Account/v1/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
module.exports = new AccountController();
