const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength validation
const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            fullName: user.full_name 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }
    );
};

const signup = async (req, res) => {
    try {
        const { 
            fullName, 
            email, 
            password, 
            phoneNumber, 
            companyName 
        } = req.body;

        // Validate input fields
        if (!fullName || fullName.trim().length < 2) {
            return res.status(400).json({ error: 'Full name must be at least 2 characters long' });
        }

        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        if (!password || !validatePassword(password)) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number' 
            });
        }

        // Check if user already exists
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate UUID
        const userId = uuidv4();

        // Default role (assuming 'user' role exists in roles table)
        const defaultRoleId = await db.one('SELECT id FROM roles WHERE name = $1', ['user']);

        // Insert user
        const newUser = await db.one(
            `INSERT INTO users 
            (id, full_name, email, password, phone_number, company_name, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
            RETURNING id, full_name, email`,
            [userId, fullName, email, hashedPassword, phoneNumber || null, companyName || null]
        );

        // Assign default user role
        await db.none(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
            [newUser.id, defaultRoleId.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser.id, 
                email: newUser.email, 
                fullName: newUser.full_name 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                fullName: newUser.full_name,
                email: newUser.email
            },
            token
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Validation Failed',
                details: 'Email and password are required' 
            });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid Email',
                details: 'Please provide a valid email address' 
            });
        }

        // Find user by email
        const user = await db.oneOrNone(
            'SELECT id, email, full_name, password FROM users WHERE email = $1', 
            [email]
        );

        // Check if user exists
        if (!user) {
            return res.status(401).json({ 
                error: 'Authentication Failed',
                details: 'Invalid email or password' 
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ 
                error: 'Authentication Failed',
                details: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = generateToken(user);

        // Fetch user roles (optional but recommended)
        const userRoles = await db.manyOrNone(
            `SELECT r.name 
             FROM roles r
             JOIN user_roles ur ON r.id = ur.role_id
             WHERE ur.user_id = $1`, 
            [user.id]
        );

        // Prepare user response
        const userResponse = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            roles: userRoles.map(role => role.name)
        };

        // Successful signin
        res.status(200).json({
            message: 'Signin successful',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ 
            error: 'Server Error',
            details: 'An unexpected error occurred during signin' 
        });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await db.oneOrNone(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Save reset token
        await db.none(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'1 hour\')',
            [user.id, resetToken]
        );

        // In a real application, you would send this token via email
        res.json({ message: 'Password reset instructions sent to email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const resetToken = await db.oneOrNone(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND is_used = false AND expires_at > NOW()',
            [token]
        );

        if (!resetToken) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and mark token as used
        await db.tx(async t => {
            await t.none(
                'UPDATE users SET password = $1 WHERE id = $2',
                [hashedPassword, resetToken.user_id]
            );

            await t.none(
                'UPDATE password_reset_tokens SET is_used = true WHERE id = $1',
                [resetToken.id]
            );
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From auth middleware

        // Get user from database
        const user = await db.one('SELECT * FROM users WHERE id = $1', [userId]);

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in database
        await db.none('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', 
            [hashedPassword, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    signup,
    signin,
    forgotPassword,
    resetPassword,
    changePassword
};
