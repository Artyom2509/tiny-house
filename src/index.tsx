import ReactDOM from 'react-dom';
import {
	AppHeader,
	Home,
	Host,
	Listing,
	Listings,
	Login,
	NotFound,
	Stripe,
	User,
} from './sections';
import ApolloClient from 'apollo-boost';
import './styles/index.css';
import { ApolloProvider, useMutation } from 'react-apollo';
import { Layout, Affix, Spin } from 'antd';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Viewer } from './lib/types';
import {
	LogIn,
	LogInVariables,
} from './lib/graphql/mutations/LogIn/__generated__/LogIn';
import { LOG_IN } from './lib/graphql/mutations/LogIn';
import { AppHeaderSkeleton } from './lib/components/AppHeaderSkeleton/index';
import { ErrorBanner } from './lib/components/ErrorBanner/index';

const client = new ApolloClient({
	uri: '/api',
	request: async (operation) => {
		const token = sessionStorage.getItem('token');
		operation.setContext({
			headers: { 'X-CSRF-TOKEN': token || '' },
		});
	},
});

const initialViewer: Viewer = {
	id: null,
	token: null,
	avatar: null,
	hasWallet: null,
	didRequest: false,
};

const App = () => {
	const [viewer, setViewer] = useState<Viewer>(initialViewer);
	const [logIn, { error }] = useMutation<LogIn, LogInVariables>(LOG_IN, {
		onCompleted: (data) => {
			if (data?.logIn) {
				setViewer(data.logIn);
				if (data.logIn.token) {
					sessionStorage.setItem('token', data.logIn.token);
				} else {
					sessionStorage.removeItem('token');
				}
			}
		},
	});
	const logInRef = useRef(logIn);

	useEffect(() => {
		logInRef.current();
	}, []);

	if (!viewer.didRequest && !error) {
		return (
			<Layout className="app-skeleton">
				<AppHeaderSkeleton />
				<div className="app-skeleton__spin-section">
					<Spin size="large" tip="Launching TinyHouse" />
				</div>
			</Layout>
		);
	}

	const errorBannerElement = error ? (
		<ErrorBanner description="We waren't able to verify if you were logged in. Please try again later!" />
	) : null;

	return (
		<Router>
			<Layout id="app">
				{errorBannerElement}
				<Affix offsetTop={0} className="app_affix-header">
					<AppHeader viewer={viewer} setViewer={setViewer} />
				</Affix>
				<Switch>
					<Route exact path="/" component={Home} />
					<Route
						exact
						path="/host"
						render={(props) => <Host {...props} viewer={viewer} />}
					/>
					<Route
						exact
						path="/stripe"
						render={(props) => (
							<Stripe {...props} viewer={viewer} setViewer={setViewer} />
						)}
					/>
					<Route exact path="/listings/:location?" component={Listings} />
					<Route exact path="/listing/:id" component={Listing} />
					<Route
						exact
						path="/user/:id"
						render={(props) => (
							<User {...props} viewer={viewer} setViewer={setViewer} />
						)}
					/>
					<Route
						exact
						path="/login"
						render={(props) => <Login {...props} setViewer={setViewer} />}
					/>
					<Route exact component={NotFound} />
				</Switch>
			</Layout>
		</Router>
	);
};

ReactDOM.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root')
);
