import { Divider, List, Avatar } from 'antd';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import { Link } from 'react-router-dom';
import { Listing } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';

interface Props {
	listingBookings: Listing['listing']['bookings'];
	bookingsPage: number;
	limit: number;
	setBookingsPage: (page: number) => void;
}

export const ListingBookings = ({
	listingBookings,
	bookingsPage,
	limit,
	setBookingsPage,
}: Props) => {
	const total = listingBookings ? listingBookings.total : null;
	const result = listingBookings ? listingBookings.result : null;

	const listingBookingsList = listingBookings ? (
		<List
			grid={{ gutter: 8, xs: 1, sm: 2, lg: 3 }}
			dataSource={result ? result : undefined}
			locale={{ emptyText: 'No bookings have been made yet!' }}
			pagination={{
				current: bookingsPage,
				total: total ? total : undefined,
				defaultPageSize: limit,
				hideOnSinglePage: true,
				showLessItems: true,
				onChange: (page) => setBookingsPage(page),
			}}
			renderItem={(listingBookings) => {
				const bookingsHistory = (
					<div className="listing-bookings__history">
						<div>
							Check in: <Text strong>{listingBookings.checkIn}</Text>
						</div>
						<div>
							Check out: <Text strong>{listingBookings.checkOut}</Text>
						</div>
					</div>
				);

				return (
					<List.Item className="listing-bookings__item">
						{bookingsHistory}
						<Link to={`/user/${listingBookings.tenant.id}`}>
							<Avatar
								src={listingBookings.tenant.avatar}
								size={64}
								shape="square"
							/>
						</Link>
					</List.Item>
				);
			}}
		/>
	) : null;

	const listingBookingsElement = listingBookingsList ? (
		<div className="listing-bookings">
			<Divider />
			<div className="listing-bookings__section">
				<Title level={4}>Bookings</Title>
			</div>
			{listingBookingsList}
		</div>
	) : null;

	return listingBookingsElement;
};
