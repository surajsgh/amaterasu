const fetch = require('isomorphic-fetch');
//  HERE THE MAIN REASONING BEHIND EXPOSING THE STATE IS 
//  TO CREATE THE INITIAL STATE TO ENABLE THE EXERCISE OF THE
//  TESTING PERFECTLY
const { app, carts, inventory } = require('./server');
const { addItemToCart } = require("./inventoryController");
const request = require('supertest');
const { hashPassword, users, authenticationMiddleware } = require('./authenticationController');

const apiRoot = 'http://localhost:3000';

const user = 'test_user';
const password = 'test@1234';
const validAuth = Buffer.from(`${user}:${password}`).toString('base64');
const authHeader = `Basic ${validAuth}`;

const createUser = () => {
  users.set(user, {
    email: 'test@email.com',
    password: hashPassword(password)
  });
}

afterAll(() => app.close());

describe('create accounts', () => {
  afterEach(() => users.clear());

  test('create a new account', async () => {
    const response = await request(app).put('/users/test_user').send({ email: 'test@email.com', password: 'test@1234'}).expect(200).expect("Content-Type", /json/);
    expect(response.body).toEqual({ message: 'test_user created successfully.'});
    expect(users.get('test_user')).toEqual({email: 'test@email.com', password: 'c001fd08c8524ff609f6eda2b34d0bb7e4c560954fcc15fde8d9b46625bc9158'});
  });

  test('duplicate account', async () => {
    users.set('test_user', 'c001fd08c8524ff609f6eda2b34d0bb7e4c560954fcc15fde8d9b46625bc9158');
    const response = await request(app).put('/users/test_user').send({ email: 'test@email.com', password: 'test@1234'}).expect(409).expect("Content-Type", /json/);
    expect(response.body).toEqual({message: 'test_user already exists.'});
    // expect(response.status).toBe(409);
  })
});

describe("add items to cart", () => {
  beforeEach(() => createUser());

  afterEach(() => {
    inventory.clear();
    carts.clear();
  });

  beforeAll(() => {
    carts.set('test_user', []);
  });

  test("add available items to the cart", async () => {
    inventory.set('cheesecake', 3);
    const response = await request(app).post('/carts/test_user/items').set('authorization', authHeader).send({item: 'cheesecake', quantity: 3}).expect(200).expect("Content-Type", /json/);
    const newItems = ['cheesecake', 'cheesecake', 'cheesecake'];
    expect(response.body).toEqual(newItems);
    expect(inventory.get('cheesecake')).toBe(0);
    expect(carts.get('test_user')).toEqual(newItems);
  });

  /*
  test("add available items to the cart", async () => {
    inventory.set('cheesecake', 1);
    const response = await request(app).post('/carts/test_user/items/cheesecake').expect(200).expect("Content-Type", /json/);
    expect(response.body).toEqual(['cheesecake']);
    expect(inventory.get('cheesecake')).toBe(0);
    expect(carts.get('test_user')).toEqual(['cheesecake']);
  });

  test("add unavailable items to the cart", async () => {
    const response = await fetch(`${apiRoot}/carts/test_user/items/cheesecake`, { method: 'POST' });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'cheesecake is unavailable.'});
  });
  */
});

/*
const addItems = (username, item) => {
  return fetch(`${apiRoot}/carts/${username}/items/${item}`, { method: 'POST'} );
}

const getItems = username => fetch(`${apiRoot}/carts/${username}/items`, { method: 'GET'});

const sendGetInventoryRequest = () => {
  return fetch(`${apiRoot}/inventory`, { method: 'GET' });
}

// SOMETIMES WHILE PASSING TEST CASES, JEST DOESN'T EXIT. TO DETECT WHAT CAUSED THIS, WE USE --detectOpenHandle.
// USING --detectOpenHandle TELLS US WHAT CAUSED THAT ISSUE.
// WE USE afterAll HOOK TO CLOSE THE CONNECTION TO FIX THIS PROBLEM.
// ALTERNATIVE SOLUTION IS TO USE --forceExit IN NPM PACKAGE ALONG WITH --detectOpenHandle
afterAll(() => app.close());

describe("addItems", () => {
  beforeEach(() => carts.clear());
  beforeEach(() => inventory.set("Cheesecake", 1));
  
  //  BREAKING THE WHOLE STEPS INTO SMALLER AND ATOMIC UNITS HELP US TO IDENTIFY THE POTENTIAL BUGS TOO SOON
  test("addItem Successful Response", async () => {
    const addItemResponse = await addItems("Lucal", "Cheesecake");
    expect(await addItemResponse.status).toBe(200);
    expect(await addItemResponse.json()).toEqual(["Cheesecake"]);
  });

  test("inventory Successful Response", async () => {
    await addItems("Lucas", "Cheesecake");
    expect(inventory.get("Cheesecake")).toBe(0);
  });

  test("cart successful Response", async () => {
    await addItems("Keith", "Cheesecake");
    expect(carts.get("Keith")).toEqual(["Cheesecake"]);
  });

  test("addItem Unsuccessful response", async () => {
    const addItemResponse = await addItems("Lucal", "cupcake");
    expect(await addItemResponse.status).toBe(404);
  });
});

describe("Testing inventory contents", () => {
  beforeEach(() => inventory.clear());

  test("fetching inventory", async () => {
    inventory.set("cheesecake", 1).set("macarroon", 2);
    const getInventoryResponse = await sendGetInventoryRequest();

    const expected = {
      ...getInventory(),
      generatedAt: expect.anything()
    };

    /*
      //  CIRCULAR ASSERTION
      //  WE'RE COMPARING THE SAME PIECE OF FUNCTION CODE
      //  THIS MIGHT CAUSE THE CONFUSION AND RAISE THE BUGS INTO THE PRODUCTION
      //  A SIMPLE WAY TO RESOLVE THIS WOULD BE TO REPLACE THE 

      const expected = {
        ...getInventory(),
        generatedAt: expect.anything()
      };

      WITH 

      const expected = {
        cheesecake: 1, 
        macarroon: 2
        generatedAt: expect.anything()
      };
    */

      /*
    expect(await getInventoryResponse.json()).toEqual(expected);
  });
});

*/
  //  WE HAVE WRITTENN ADD TO CART TEST CASE TOO RIGOROUSLY BUT LET'S ASSUME IF ANY ERROR OCCURS
  //  WE'LL FAIL TO IDENTIFY WHERE THE ERROR IS COMING FROM
  //  SO WE'LL SEPRATE THE FOLLOWING ASSERTIONS INTO MANY SEPARATE TEST CASES.
  /*
  test("Adding items to a cart", async () => {
    inventory.set("cheesecake", 1);
    const addItemsResponse = await addItems("Lucas", "cheesecake");
    expect(await addItemsResponse.json()).toEqual(["cheesecake"]);
    expect(inventory.get("cheesecake")).toBe(0);

    expect(carts.get("Lucas")).toEqual(["cheesecake"]);

    const failedAddItemResponse = await addItems("Lucas", "cupcake");
    expect(await failedAddItemResponse.status).toBe(404);
  });
  */