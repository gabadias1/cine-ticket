const authController = require('../../src/controllers/authController');
const prisma = require('../../src/prismaClient');

// Mock Prisma
jest.mock('../../src/prismaClient', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            req.body = { name: 'Test', email: 'test@example.com', password: 'password' };
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({ id: 1, ...req.body });

            await authController.register(req, res);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(prisma.user.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                user: expect.objectContaining({ email: 'test@example.com' })
            }));
        });

        it('should return 400 if user already exists', async () => {
            req.body = { name: 'Test', email: 'existing@example.com', password: 'password' };
            prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'existing@example.com' });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
        });

        it('should return 500 on server error', async () => {
            req.body = { email: 'error@example.com' };
            prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('login', () => {
        it('should login with valid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'password' };
            prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'password' });

            await authController.login(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                user: expect.objectContaining({ email: 'test@example.com' })
            }));
        });

        it('should return 401 with invalid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'wrong' };
            prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'password' });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        it('should return 401 if user not found', async () => {
            req.body = { email: 'notfound@example.com', password: 'password' };
            prisma.user.findUnique.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
        });

        it('should return 500 on server error', async () => {
            req.body = { email: 'error@example.com' };
            prisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});
