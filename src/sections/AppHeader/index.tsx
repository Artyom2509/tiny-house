import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import appLogo from './assets/tinyhouse-logo.png';
import { Layout, Input } from 'antd';
import { MenuItems } from './components';
import { Viewer } from '../../lib/types';
import { displayErrorMessage } from '../../lib/utils';
import { useEffect, useState } from 'react';

const { Header } = Layout;
const { Search } = Input;

interface Props extends RouteComponentProps {
	viewer: Viewer;
	setViewer: (viewer: Viewer) => void;
}

export const AppHeader = withRouter(
	({ viewer, setViewer, history, location, match }: Props) => {
		const [search, setSearch] = useState('');

		useEffect(() => {
			const { pathname } = location;
			const pathnameSubStrings = pathname.split('/');

			if (!pathname.includes('/listings')) {
				setSearch('');
				return;
			}

			if (pathname.includes('/listings') && pathnameSubStrings.length === 3) {
				setSearch(pathnameSubStrings[2]);
				return;
			}
		}, [location]);

		const onSearch = (value: string) => {
			const trimmedValue = value.trim();

			if (trimmedValue) {
				history.push(`/listings/${trimmedValue}`);
			} else {
				displayErrorMessage('Please enter a valid search!');
			}
		};

		return (
			<Header className="app-header">
				<div className="app-header__logo-search-section">
					<div className="app-header__logo">
						<Link to="/">
							<img src={appLogo} alt="app logo" />
						</Link>
					</div>
					<div className="app-header__search-input">
						<Search
							placeholder="Search 'San Fransisco'"
							enterButton
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							onSearch={onSearch}
						/>
					</div>
				</div>

				<div className="app-header__menu-section">
					<MenuItems viewer={viewer} setViewer={setViewer} />
				</div>
			</Header>
		);
	}
);
