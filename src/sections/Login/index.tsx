import React, { useEffect, useRef } from 'react';
import { Card, Layout, Typography, Spin } from 'antd';
import googleLogo from './assets/google_logo.jpg';
import { Viewer } from '../../lib/types';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { AuthUrl } from '../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl';
import { AUTH_URL } from './../../lib/graphql/queries/AuthUrl/index';
import {
	LogIn,
	LogInVariables,
} from '../../lib/graphql/mutations/LogIn/__generated__/LogIn';
import { LOG_IN } from '../../lib/graphql/mutations/LogIn';
import {
	displayErrorMessage,
	displaySuccessNotification,
} from './../../lib/utils/index';
import { ErrorBanner } from '../../lib/components';
import { Redirect } from 'react-router';

const { Content } = Layout;
const { Text, Title } = Typography;

interface Props {
	setViewer: (viewer: Viewer) => void;
}

export const Login = ({ setViewer }: Props) => {
	const client = useApolloClient();
	const [
		logIn,
		{ data: logInData, loading: logInLoading, error: logInError },
	] = useMutation<LogIn, LogInVariables>(LOG_IN, {
		onCompleted: (data) => {
			if (data?.logIn?.token) {
				setViewer(data.logIn);
				sessionStorage.setItem('token', data.logIn.token);
				displaySuccessNotification("You've successfully logged in!");
			}
		},
	});
	const logInRef = useRef(logIn);

	useEffect(() => {
		const code = new URL(window.location.href).searchParams.get('code');

		if (code) {
			logInRef.current({
				variables: {
					input: { code },
				},
			});
		}
	}, []);

	const handleAuthorize = async () => {
		try {
			const { data } = await client.query<AuthUrl>({
				query: AUTH_URL,
			});
			window.location.href = data.authUrl;
		} catch (error) {
			displayErrorMessage(
				"Sorry! We waren't able to log you in. Please try again later!"
			);
		}
	};

	const logInErrorBannerElement = logInError ? (
		<ErrorBanner description="Sorry! We waren't able to log you in. Please try again later!" />
	) : null;

	if (logInData?.logIn) {
		const { id: vieverId } = logInData.logIn;
		return <Redirect to={`/user/${vieverId}`} />;
	}

	if (logInLoading) {
		return (
			<Content className="log-in">
				<Spin size="large" tip="Logging you in..." />
			</Content>
		);
	}

	return (
		<Content className="log-in">
			{logInErrorBannerElement}
			<Card className="log-in-card">
				<div className="log-in-card__intro">
					<Title level={3} className="log-in-card__intro-title">
						<span role="img" aria-label="wave">
							👋
						</span>
					</Title>
					<Title level={3} className="log-in-card__intro-title">
						Log in to TinyHouse!
					</Title>
					<Text>Sign in with Google to start booking available rentals!</Text>
				</div>
				<button
					onClick={handleAuthorize}
					className="log-in-card__google-button">
					<img
						src={googleLogo}
						alt="google logo"
						className="log-in-card__google-button-logo"
					/>
					<span className="log-in-card__google-button-text">
						Sign in with Google
					</span>
				</button>
				<Text type="secondary">
					Note: By signin in, you'll be redirected to the Google consent form to
					sign in with your Google account.
				</Text>
			</Card>
		</Content>
	);
};
