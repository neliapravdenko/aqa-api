const axios = require("axios").default;

describe("Get requests", () => {
  test("Get all comments to second post [/posts/2/comments] and verify postId in all comments", async () => {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts/2/comments"
    );
    const comments = response.data;
    expect(response.status).toBe(200);
    comments.forEach((comment) => {
      expect(comment.postId).toBe(2);
    });
  });

  test("Get all posts for first user [/users/1/posts] and verify the number", async () => {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/users/1/posts"
    );
    const responseBody = response.data;
    expect(response.status).toBe(200);
    expect(responseBody).toHaveLength(10);
  });

  test("Get all info about last post [/posts/100] and verify userId, id, title, body", async () => {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts/100"
    );
    const responseBody = response.data;
    expect(response.status).toBe(200);
    expect(responseBody.userId).not.toBe(1);
    expect(responseBody.id).toBe(100);
    expect(responseBody.title).toBe("at nam consequatur ea labore ea harum");
    expect(responseBody.body).toContain("soluta\nipsa");
  });
});

describe("Post requests", () => {
  test("Create new todo for tenth user [/users/10/todos] and verify the response is successful", async () => {
    const newTodo = {
      title: "Test todo",
      completed: true,
    };

    const response = await axios.post(
      "https://jsonplaceholder.typicode.com/users/10/todos",
      newTodo
    );
    const responseBody = response.data;
    expect(response.status).toBe(201);
    expect(responseBody.id).toBe(201);
    expect(responseBody.userId).toBe("10");
    expect(responseBody.title).toEqual(newTodo.title);
    expect(responseBody.completed).toEqual(newTodo.completed);
  });

  test("Create new album [/albums] and verify the response is successful", async () => {
    const newAlbum = {
      userId: "10",
      title: "Test todo",
    };

    const response = await axios.post(
      "https://jsonplaceholder.typicode.com/albums",
      newAlbum
    );
    const responseBody = response.data;
    expect(response.status).toBe(201);
    expect(responseBody.id).toBe(101);
    expect(responseBody.userId).toEqual(newAlbum.userId);
    expect(responseBody.title).toEqual(newAlbum.title);
  });
});
