const axios = require("axios").default;
const AccountController = require("../api-controllers/AccountController");
const BooksController = require("../api-controllers/BooksController");
const { faker } = require("@faker-js/faker");

// Test data for all test suites
const TEST_DATA = {
  user: {
    userName: faker.internet.username(),
    password: "SecurePass123!",
  },
  knownUser: {
    username: "Nelia",
    password: "Test123!",
  },
  books: {
    firstBookIsbn: "9781449325862", // ISBN of the first book in catalog
    lastBookIsbn: "9781593277574", // ISBN of the last book in catalog
  },
};

// Global variables for tests
let token;
let randomBookIsbn; // Random book ISBN for tests

describe("Books tests", () => {
  // Before all tests: create user and get test data
  beforeAll(async () => {
    const creationResponse = await AccountController.createUser(TEST_DATA.user.userName, TEST_DATA.user.password);
    console.log("User creation response:", creationResponse.data);

    // Store created user ID for subsequent tests
    TEST_DATA.user.userId = await AccountController.getUserId(TEST_DATA.user.userName, TEST_DATA.user.password);

    // Get authorization token for requests
    token = await AccountController.getAuthToken(TEST_DATA.user.userName, TEST_DATA.user.password);
    console.log(`token: ${token}`);

    // Select random book from catalog for tests
    const booksResponse = await BooksController.getAllBooks();
    const randomBookIndex = Math.floor(Math.random() * booksResponse.data.books.length);
    randomBookIsbn = booksResponse.data.books[randomBookIndex].isbn;
  });

  // Before each test: clear user's book collection
  beforeEach(async () => {
    await BooksController.removeAllBooks(TEST_DATA.user.userId, token);
  });

  // Test: Get all books and verify count
  test("Get all books and verify length [/BookStore/v1/Books]", async () => {
    const response = await BooksController.getAllBooks();
    const responseBody = response.data;
    expect(response.status).toBe(200);
    expect(responseBody.books).toHaveLength(8);
  });

  // Test: Verify author of first book in catalog
  test("Verify first book's author [/BookStore/v1/Books]", async () => {
    const response = await BooksController.getAllBooks();
    const responseBody = response.data;
    expect(response.status).toBe(200);
    expect(responseBody.books[0].author).toBe("Richard E. Silverman");
  });

  // Test: Get book information by ISBN and verify title
  test("Get last book and verify title [/BookStore/v1/Book]", async () => {
    const response = await BooksController.getBook(TEST_DATA.books.lastBookIsbn);
    const responseBody = response.data;
    expect(response.status).toBe(200);
    expect(responseBody.title).toBe("Understanding ECMAScript 6");
  });

  // Test: Add book to user's collection
  test("Add a book and verify isbn [/BookStore/v1/Books]", async () => {
    const response = await BooksController.addBook(token, TEST_DATA.user.userId, randomBookIsbn);
    const responseBody = response.data;
    expect(response.status).toBe(201);
    expect(responseBody.books[0].isbn).toBe(randomBookIsbn);
  });

  // Complex test: Add, update and delete book
  test("Add, update and delete book, and verify successful responses [/BookStore/v1/Books]", async () => {
    // Add book
    const addResponse = await BooksController.addBook(token, TEST_DATA.user.userId, TEST_DATA.books.firstBookIsbn);
    expect(addResponse.status).toBe(201);

    // Update added book
    const updateResponse = await BooksController.updateBook(
      TEST_DATA.user.userId,
      token,
      TEST_DATA.books.firstBookIsbn,
      TEST_DATA.books.lastBookIsbn
    );
    expect(updateResponse.status).toBe(200);

    // Delete updated book
    const deleteResponse = await BooksController.removeBook(TEST_DATA.user.userId, token, TEST_DATA.books.lastBookIsbn);
    expect(deleteResponse.status).toBe(204);
  });

  // After all tests: clean up test data
  afterAll(async () => {
    await BooksController.removeAllBooks(TEST_DATA.user.userId, token);
    await AccountController.deleteUser(TEST_DATA.user.userId, token);
  });
});

describe("Auth tests", () => {
  let token;
  let userId;
  let testUser;

  // Before all tests: get existing user data
  beforeAll(async () => {
    token = await AccountController.getAuthToken(TEST_DATA.knownUser.username, TEST_DATA.knownUser.password);
    userId = await AccountController.getUserId(TEST_DATA.knownUser.username, TEST_DATA.knownUser.password);
  });

  // Test: Register new user
  test("Register new user and verify data [/Account/v1/Authorized]", async () => {
    const randomUserName = `nelia${Date.now().toString().slice(5, 10)}`;
    const response = await AccountController.createUser(randomUserName, TEST_DATA.knownUser.password);

    // Store test user data for later cleanup
    testUser = {
      id: response.data.userID,
      name: randomUserName,
      token: await AccountController.getAuthToken(randomUserName, TEST_DATA.knownUser.password),
    };

    // Verify successful creation and user data
    expect(response.status).toBe(201);
    expect(response.data.userID).toBeTruthy();
    expect(response.data.username).toBe(randomUserName);
    expect(response.data.books).toHaveLength(0);
  });

  // Test: Get existing user data
  test("Get known user and verify userId and username [/Account/v1/User]", async () => {
    const response = await AccountController.getUser(userId, token);
    expect(response.status).toBe(200);
    expect(response.data.username).toBe(TEST_DATA.knownUser.username);
    expect(response.data.userId).toBe(userId);
  });

  // After all tests: delete test user if created
  afterAll(async () => {
    if (testUser?.id) {
      await AccountController.deleteUser(testUser.id, testUser.token);
    }
  });
});

describe("Negative tests", () => {
  let userId;
  let token;
  const isbn = "test123"; // Invalid ISBN for negative test

  // Before all tests: get existing user data
  beforeAll(async () => {
    userId = await AccountController.getUserId(TEST_DATA.knownUser.username, TEST_DATA.knownUser.password);
    token = await AccountController.getAuthToken(TEST_DATA.knownUser.username, TEST_DATA.knownUser.password);
  });

  // Test: Attempt to add book with invalid ISBN
  test("Try to add invalid book and verify status [/BookStore/v1/Books]", async () => {
    const response = await BooksController.addBook(token, userId, isbn);
    expect(response.status).toBe(400); // Expect "Bad Request" error
  });

  // Test: Attempt to delete user without auth token
  test("Try to delete user without token and verify status [/Account/v1/User]", async () => {
    const response = await AccountController.deleteUser(userId);
    expect(response.status).toBe(401); // Expect "Unauthorized" error
  });
});
