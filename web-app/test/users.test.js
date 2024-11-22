const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const { createApp, setupDatabase } = require('../index'); // Adjust the path accordingly

jest.mock('sqlite3', () => ({
  verbose: jest.fn(() => ({
    Database: jest.fn().mockImplementation((databasePath) => {
      if (databasePath === ':memory:') {
        return {
          serialize: jest.fn(),
          run: jest.fn(),
          get: jest.fn(),
          all: jest.fn()
        };
      }
      throw new Error('Unsupported database path');
    })
  }))
}));

describe('API Endpoints', () => {
  let app;
  let db;

  beforeEach(() => {
    db = setupDatabase();
    app = createApp(db);
  });

  afterEach(() => {
    jest.clearAllMocks();
    db.close(); // Close the database connection after each test
  });

  describe('/api/users POST', () => {
    it('should create a new user successfully', async () => {
      const mockUser = { userEmailHash: 'hash', publicKey: 'key', secretKeyHash: 'secret' };
      db.run.mockResolvedValue({});

      const res = await request(app)
        .post('/api/users')
        .send(mockUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.run).toHaveBeenCalledWith("INSERT INTO users (userEmailHash, publicKey, secretKeyHash) VALUES (?, ?, ?)", ['hash', 'key', 'secret']);
    });
  });

  describe('/api/websites POST', () => {
    it('should create a new website successfully', async () => {
      const mockWebsite = { userid: 1, websiteUrl: 'https://example.com', passwordHash: 'hash' };
      db.run.mockResolvedValue({});

      const res = await request(app)
        .post('/api/websites')
        .send(mockWebsite);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.run).toHaveBeenCalledWith("INSERT INTO websites (userid, websiteUrl, passwordHash) VALUES (?, ?, ?)", expect.any(Array));
    });

    it('should return an error if database operation fails', async () => {
      const mockError = new Error('Database error');
      db.run.mockRejectedValue(mockError);

      const res = await request(app)
        .post('/api/websites')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(mockError.message);
    });
  });

  describe('/api/getUser POST', () => {
    it('should retrieve a user successfully', async () => {
      const mockUser = { userEmailHash: 'hash', publicKey: 'key', secretKeyHash: 'secret' };
      db.get.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/getUser')
        .send({ userEmailHash: 'hash' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockUser);
      expect(db.get).toHaveBeenCalledWith("SELECT * FROM users WHERE userEmailHash = ?", ['hash']);
    });

    it('should return an error if database operation fails', async () => {
      const mockError = new Error('Database error');
      db.get.mockRejectedValue(mockError);

      const res = await request(app)
        .post('/api/getUser')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(mockError.message);
    });
  });

  describe('/api/getWebsites POST', () => {
    it('should retrieve websites successfully', async () => {
      const mockWebsites = [{ id: 1, userid: 1, websiteUrl: 'https://example.com', passwordHash: 'hash' }];
      db.all.mockResolvedValue(mockWebsites);

      const res = await request(app)
        .post('/api/getWebsites')
        .send({ userid: 1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockWebsites);
      expect(db.all).toHaveBeenCalledWith("SELECT * FROM websites WHERE userid = ?", [1]);
    });

    it('should return an error if database operation fails', async () => {
      const mockError = new Error('Database error');
      db.all.mockRejectedValue(mockError);

      const res = await request(app)
        .post('/api/getWebsites')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(mockError.message);
    });
  });

  describe('/api/updateUser POST', () => {
    it('should update a user successfully', async () => {
      const mockUpdateData = { id: 1, userEmailHash: 'newHash', publicKey: 'newKey', secretKeyHash: 'newSecret' };
      db.run.mockResolvedValue({});

      const res = await request(app)
        .post('/api/updateUser')
        .send(mockUpdateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.run).toHaveBeenCalledWith("UPDATE users SET userEmailHash = ?, publicKey = ?, secretKeyHash = ? WHERE id = ?", ['newHash', 'newKey', 'newSecret', 1]);
    });

    it('should return an error if database operation fails', async () => {
      const mockError = new Error('Database error');
      db.run.mockRejectedValue(mockError);

      const res = await request(app)
        .post('/api/updateUser')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(mockError.message);
    });
  });

  describe('/api/deleteWebsite POST', () => {
    it('should delete a website successfully', async () => {
      db.run.mockResolvedValue({});

      const res = await request(app)
        .post('/api/deleteWebsite')
        .send({ id: 1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.run).toHaveBeenCalledWith("DELETE FROM websites WHERE id = ?", [1]);
    });

    it('should return an error if database operation fails', async () => {
      const mockError = new Error('Database error');
      db.run.mockRejectedValue(mockError);

      const res = await request(app)
        .post('/api/deleteWebsite')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(mockError.message);
    });
  });

  describe('/api/deleteUser POST', () => {
    it('should delete a user successfully', async () => {
      db.run.mockResolvedValue({});

      const res = await request(app)
        .post('/api/deleteUser')
        .send({ id: 1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(db.run).toHaveBeenCalledWith("DELETE FROM users WHERE id = ?", [1]);
    });

    it('should return an error if database operation fails', async () => {
      const mockError = new Error('Database error');
      db.run.mockRejectedValue(mockError);

      const res = await request(app)
        .post('/api/deleteUser')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.error).toBe(mockError.message);
    });
  });
});

