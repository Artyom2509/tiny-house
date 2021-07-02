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
	setViewer: (viewer: Viewer) => void;
}

const PAGE_LIMIT = 4;

export const User = ({
	viewer,
	setViewer,
	match,
}: Props & RouteComponentProps<MatchParams>) => {
	const [listingsPage, setListingsPage] = useState(1);
	const [bookingsPage, setBookingsPage] = useState(1);

	const { data, loading, error, refetch } = useQuery<UserData, UserVariables>(
		USER,
		{
			variables: {
				id: match.params.id,
				bookingsPage,
				listingsPage,
				limit: PAGE_LIMIT,
			},
			fetchPolicy: 'cache-and-network',
		}
	);

	const handleUserRefetch = async () => {
		await refetch();
	};

	const stripeError = new URL(window.location.href).searchParams.get(
		'stripe_error'
	);
	const stripeErrorBanner = stripeError ? (
		<ErrorBanner description="We had an issue connecting with Stripe. Please try again soon." />
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

	const user = data ? data.user : null;
	const viewerIsUser = viewer.id === match.params.id;

	const userListings = user ? user.listings : null;
	const userBookings = user ? user.bookings : null;

	const userProfileElement = user ? (
		<UserProfile
			user={user}
			viewer={viewer}
			viewerIsUser={viewerIsUser}
			setViewer={setViewer}
			handleUserRefetch={handleUserRefetch}
		/>
	) : null;

	const userListingsElement = userListings ? (
		<UserListings
			userListings={userListings}
			listingsPage={listingsPage}
			limit={PAGE_LIMIT}
			setListingsPage={setListingsPage}
		/>
	) : null;

	const userBookingsElement = userListings ? (
		<UserBookings
			userBookings={userBookings}
			bookingsPage={bookingsPage}
			limit={PAGE_LIMIT}
			setBookingsPage={setBookingsPage}
		/>
	) : null;

	return (
		<Content className="user">
			{stripeErrorBanner}
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
