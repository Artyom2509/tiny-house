import { Button, Menu, Avatar } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Viewer } from '../../../../lib/types';
import { useMutation } from '@apollo/react-hooks';
import { LogOut } from '../../../../lib/graphql/mutations/LogOut/__generated__/LogOut';
import { LOG_OUT } from '../../../../lib/graphql/mutations/LogOut';
import {
	displayErrorMessage,
	displaySuccessNotification,
} from './../../../../lib/utils/index';

const { Item, SubMenu } = Menu;

interface Props {
	viewer: Viewer;
	setViewer: (viewer: Viewer) => void;
}

export const MenuItems = ({ viewer, setViewer }: Props) => {
	const [logOut] = useMutation<LogOut>(LOG_OUT, {
		onCompleted: (data) => {
			if (data?.logOut) {
				setViewer(data.logOut);
				sessionStorage.removeItem('token');
				displaySuccessNotification("You've successfully logged out");
			}
		},
		onError: () => {
			displayErrorMessage(
				"Sorry! We weren't able to log you out. Please try again later!"
			);
		},
	});

	const handleLogout = () => logOut();

	const subMenuLogin =
		viewer.id && viewer.avatar ? (
			<SubMenu title={<Avatar src={viewer.avatar} />}>
				<Item key="/user">
					<Link to={`/user/${viewer.id}`}>
						<UserOutlined />
						Profile
					</Link>
				</Item>
				<Item key="/logout">
					<div onClick={handleLogout}>
						<LogoutOutlined />
						Log out
					</div>
				</Item>
			</SubMenu>
		) : (
			<Item>
				<Link to="/login">
					<Button type="primary">Sign In</Button>
				</Link>
			</Item>
		);

	return (
		<Menu mode="horizontal" selectable={false} className="menu">
			<Item key="/host">
				<Link to="/host">
					<HomeOutlined /> Host
				</Link>
			</Item>
			{subMenuLogin}
		</Menu>
	);
};
