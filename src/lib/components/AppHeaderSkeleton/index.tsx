import appLogo from './assets/tinyhouse-logo.png';
import { Layout } from 'antd';

const { Header } = Layout;

export const AppHeaderSkeleton = () => {
	return (
		<Header className="app-header">
			<div className="app-header__logo-search-section">
				<div className="app-header__logo">
					<img src={appLogo} alt="app logo" />
				</div>
			</div>
		</Header>
	);
};
