const prisma = require('../prismaClient');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user (in production, hash password!)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // TODO: Hash this
            },
        });

        res.status(201).json({ user });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) { // TODO: Compare hash
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // In a real app, generate JWT here
        res.json({ user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.me = async (req, res) => {
    // Mock implementation for now
    res.json({ message: 'Not implemented yet' });
};
