import React, { useState } from 'react';
import './Auth.css';

const ChangePassword = ({ onSwitchToLogin }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to change your password.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to change password.');
            }

            setMessage('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Change Password</h2>
                <div className="form-group">
                    <label htmlFor="old-password">Old Password</label>
                    <input
                        type="password"
                        id="old-password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                {message && <p className="auth-message success">{message}</p>}
                {error && <p className="auth-message error">{error}</p>}
                <button type="submit" className="auth-button">Update Password</button>
                <p className="auth-switch">
                    <button type="button" onClick={onSwitchToLogin} className="auth-switch-button">
                        Back to Login
                    </button>
                </p>
            </form>
        </div>
    );
};

export default ChangePassword;
