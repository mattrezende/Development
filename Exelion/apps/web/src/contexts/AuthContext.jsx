import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [initialLoading, setInitialLoading] = useState(true);

	useEffect(() => {
		apiClient
			.get('/auth/me')
			.then(({ teacher }) => setCurrentUser(teacher))
			.catch(() => setCurrentUser(null))
			.finally(() => setInitialLoading(false));
	}, []);

	const login = async (email, password) => {
		const { teacher } = await apiClient.post('/auth/login', { email, password });
		setCurrentUser(teacher);
		return teacher;
	};

	const signup = async (formData) => {
		const { teacher } = await apiClient.post('/auth/signup', {
			email: formData.email,
			password: formData.password,
			name: formData.name,
			professionalDescription: formData.professional_description,
		});
		setCurrentUser(teacher);
		return teacher;
	};

	const logout = async () => {
		await apiClient.post('/auth/logout');
		setCurrentUser(null);
	};

	const requestPasswordReset = async (email) => {
		await apiClient.post('/auth/password-reset', { email });
	};

	const updateProfile = async (id, data) => {
		const { teacher } = await apiClient.patch('/teachers/me', data);
		setCurrentUser(teacher);
		return teacher;
	};

	const refreshCurrentUser = async () => {
		const { teacher } = await apiClient.get('/auth/me');
		setCurrentUser(teacher);
		return teacher;
	};

	const value = {
		currentUser,
		login,
		signup,
		logout,
		requestPasswordReset,
		updateProfile,
		refreshCurrentUser,
		isAuthenticated: !!currentUser,
	};

	if (initialLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
