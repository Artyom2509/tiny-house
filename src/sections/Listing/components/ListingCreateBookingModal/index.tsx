import { KeyOutlined } from '@ant-design/icons';
import { Modal, Button, Divider, Typography } from 'antd';
import moment, { Moment } from 'moment';
import { formatListingPrice } from '../../../../lib/utils';

const { Text, Paragraph, Title } = Typography;

interface Props {
	price: number;
	checkInDate: Moment;
	checkOutDate: Moment;
	modalVisible: boolean;
	setModalVisible: (modalVisible: boolean) => void;
}

export const ListingCreateBookingModal = ({
	modalVisible,
	price,
	checkInDate,
	checkOutDate,
	setModalVisible,
}: Props) => {
	const daysBooked = moment(checkOutDate).diff(checkInDate, 'days') + 1;
	const listingPrice = price * daysBooked;

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
					<Button
						className="listing-booking-modal__cta"
						size="large"
						type="primary">
						Book
					</Button>
				</div>
			</div>
		</Modal>
	);
};
