const BaseController = require("./BaseController");

class BooksController extends BaseController {
  async getAllBooks() {
    return await this.axiosInstance.get("/BookStore/v1/Books");
  }

  async addBook(token, userId, isbn) {
    return await this.axiosInstance.post(
      "/BookStore/v1/Books",
      {
        userId: userId,
        collectionOfIsbns: [
          {
            isbn: isbn,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async removeAllBooks(userId, token) {
    return await this.axiosInstance.delete(`/BookStore/v1/Books?UserId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getBook(isbn) {
    return await this.axiosInstance.get(`/BookStore/v1/Book?ISBN=${isbn}`);
  }

  async removeBook(userId, token, isbn) {
    return await this.axiosInstance.delete(
      `/BookStore/v1/Book`,
      {
        data: {
          isbn: isbn,
          userId: userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async updateBook(userId, token, currentIsbn, newIsbn) {
    return await this.axiosInstance.put(
      `/BookStore/v1/Books/${currentIsbn}`,
      {
        isbn: newIsbn,
        userId: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}

module.exports = new BooksController();
