import { useQuery } from '@apollo/react-hooks';
import { Col, Layout, Row } from 'antd';
import { RouteComponentProps } from 'react-router';
import { USER } from '../../lib/graphql/queries';
import {
	User as UserData,
	UserVariables,
} from '../../lib/graphql/queries/User/__generated__/User';
import { Viewer } from '../../lib/types';
import { UserProfile } from './components/UserProfile';
import { PageSkeleton } from './../../lib/components/PageSkeleton/index';
import { ErrorBanner } from '../../lib/components';
import { useState } from 'react';
import { UserListings } from './components/UserListings';
import { UserBookings } from './components/UserBookings';

const { Content } = Layout;

interface MatchParams {
	id: string;
}

interface Props {
	viewer: Viewer;
}

const PAGE_LIMIT = 4;

export const User = ({
	match,
	viewer,
}: Props & RouteComponentProps<MatchParams>) => {
	const [bookingsPage, setBookingsPage] = useState(1);
	const [listingsPage, setListingsPage] = useState(1);
	const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
		variables: {
			id: match.params.id,
			bookingsPage,
			listingsPage,
			limit: PAGE_LIMIT,
		},
		onError: console.log
	});
	console.log('data', match.params.id, data);

	const user = data ? data.user : null;
	const viewerIsUser = viewer.id === match.params.id;

	const userListings = user ? user.listings : null;
	const userBookings = user ? user.bookings : null;

	const userProfileElement = user ? (
		<UserProfile user={user} viewerIsUser={viewerIsUser} />
	) : null;

	const userListingsElement = userListings ? (
		<UserListings
			userListings={userListings}
			listingsPage={listingsPage}
			limit={PAGE_LIMIT}
			setListingsPage={setListingsPage}
		/>
	) : null;

	const userBookingsElement = userBookings ? (
		<UserBookings
			userBookings={userBookings}
			bookingsPage={bookingsPage}
			limit={PAGE_LIMIT}
			setBookingsPage={setBookingsPage}
		/>
	) : null;

	if (loading) {
		return (
			<Content className="user">
				<PageSkeleton />
			</Content>
		);
	}

	if (error) {
		return (
			<Content className="user">
				<ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon." />
				<PageSkeleton />
			</Content>
		);
	}

	return (
		<Content className="user">
			<Row gutter={12} justify="space-between">
				<Col xs={24}>{userProfileElement}</Col>
				<Col xs={24}>
					{userListingsElement}
					{userBookingsElement}
				</Col>
			</Row>
		</Content>
	);
};
