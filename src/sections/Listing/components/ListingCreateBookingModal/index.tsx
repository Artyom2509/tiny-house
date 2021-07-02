import { KeyOutlined } from '@ant-design/icons';
import { Modal, Button, Divider, Typography } from 'antd';
import {
	CardElement,
	injectStripe,
	ReactStripeElements,
} from 'react-stripe-elements';
import moment, { Moment } from 'moment';
import {
	displayErrorMessage,
	displaySuccessNotification,
	formatListingPrice,
} from '../../../../lib/utils';
import { useMutation } from 'react-apollo';
import { CREATE_BOOKING } from '../../../../lib/graphql/mutations/CreateBooking';
import {
	CreateBooking,
	CreateBookingVariables,
} from '../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking';

const { Text, Paragraph, Title } = Typography;

interface Props {
	id: string;
	price: number;
	checkInDate: Moment;
	checkOutDate: Moment;
	modalVisible: boolean;
	setModalVisible: (modalVisible: boolean) => void;
	handleListingRefetch: () => Promise<void>;
	clearBookingData: () => void;
}

export const ListingCreateBookingModal = ({
	id,
	modalVisible,
	price,
	checkInDate,
	checkOutDate,
	stripe,
	setModalVisible,
	clearBookingData,
	handleListingRefetch,
}: Props & ReactStripeElements.InjectedStripeProps) => {
	const daysBooked = moment(checkOutDate).diff(checkInDate, 'days') + 1;
	const listingPrice = price * daysBooked;

	const [createBooking, { loading }] = useMutation<
		CreateBooking,
		CreateBookingVariables
	>(CREATE_BOOKING, {
		onCompleted() {
			clearBookingData();
			displaySuccessNotification("You've successfully booked the listing!");
			handleListingRefetch();
		},
		onError() {
			displayErrorMessage(
				"Sorry! We waren't able to successfully book the listing. Please try again later!"
			);
		},
	});

	const handleCreateBooking = async () => {
		if (!stripe)
			return displayErrorMessage(
				"Sorry! We waren't able to connect with Stripe."
			);

		let { token: stripeToken, error } = await stripe.createToken();
		if (stripeToken) {
			createBooking({
				variables: {
					input: {
						id,
						source: stripeToken.id,
						checkIn: moment(checkInDate).format('YYYY-MM-DD'),
						checkOut: moment(checkOutDate).format('YYYY-MM-DD'),
					},
				},
			});
		} else {
			displayErrorMessage(
				error && error.message
					? error.message
					: "Sorry! We waren't able to book the listing. Please try again later."
			);
		}
	};

	return (
		<Modal
			visible={modalVisible}
			centered
			footer={null}
			onCancel={() => setModalVisible(false)}>
			<div className="listing-booking-modal">
				<div className="listing-booking-modal__intro">
					<Title className="listing-booking-modal__intro-title">
						<KeyOutlined />
					</Title>
					<Title level={3} className="listing-booking-modal__intro-title">
						Book your trip
					</Title>
					<Paragraph>
						Enter your payment information to book the listing from the dates
						between{' '}
						<Text mark strong>
							{moment(checkInDate).format('MMMM Do YYYY')}
						</Text>
						{' - '}
						<Text mark strong>
							{moment(checkOutDate).format('MMMM Do YYYY')}
						</Text>
						, inclusive.
					</Paragraph>
				</div>

				<Divider />

				<div className="listing-booking-modal__charge-summary">
					<Paragraph>
						{formatListingPrice(price, false)} * {daysBooked} days = {''}
						<Text strong>{formatListingPrice(listingPrice, false)}</Text>
					</Paragraph>
					<Paragraph className="listing-booking-modal__charge-summary-total">
						Total = <Text>{formatListingPrice(listingPrice, false)}</Text>
					</Paragraph>
				</div>

				<Divider />

				<div className="listing-booking-modal__stripe-card-section">
					<CardElement
						hidePostalCode
						className="listing-booking-modal__stripe-card"
					/>
					<Button
						className="listing-booking-modal__cta"
						size="large"
						onClick={handleCreateBooking}
						loading={loading}
						type="primary">
						Book
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export const WrappedListingCreateBookingModal = injectStripe(
	ListingCreateBookingModal
);
