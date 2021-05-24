import { Button, Card, DatePicker, Divider } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import Title from 'antd/lib/typography/Title';
import moment, { Moment } from 'moment';
import { displayErrorMessage, formatListingPrice } from '../../../../lib/utils';
import Text from 'antd/lib/typography/Text';
import { Viewer } from '../../../../lib/types';
import { Listing_listing as ListingData } from './../../../../lib/graphql/queries/Listing/__generated__/Listing';
import { BookingsIndex } from './types';

interface Props {
	viewer: Viewer;
	host: ListingData['host'];
	bookingsIndex: ListingData['bookingsIndex'];
	price: number;
	checkInDate: Moment | null;
	checkOutDate: Moment | null;
	setCheckOutDate: (date: Moment | null) => void;
	setCheckInDate: (date: Moment | null) => void;
	setModalVisible: (modalVisible: boolean) => void;
}

export const ListingCreateBooking = ({
	viewer,
	host,
	bookingsIndex,
	price,
	checkInDate,
	checkOutDate,
	setCheckInDate,
	setModalVisible,
	setCheckOutDate,
}: Props) => {
	const dateIsBooked = (currentDate: Moment) => {
		const year = moment(currentDate).year();
		const month = moment(currentDate).month();
		const day = moment(currentDate).date();

		if (bookingsIndexJSON[year] && bookingsIndexJSON[year][month]) {
			return Boolean(bookingsIndexJSON[year][month][day]);
		} else {
			return false;
		}
	};

	const disabledDate = (currentDate?: Moment): boolean => {
		if (currentDate) {
			const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf('day'));

			return dateIsBeforeEndOfDay || dateIsBooked(currentDate);
		} else {
			return false;
		}
	};

	const bookingsIndexJSON: BookingsIndex = JSON.parse(bookingsIndex);

	const viewerIsHost = viewer.id === host.id;
	const checkInInputDisabled = !viewer?.id || viewerIsHost || !host.hasWallet;
	const checkOutInputDisabled = checkInInputDisabled || !checkInDate;
	const buttonDisabled = checkInInputDisabled || !checkInDate || !checkOutDate;

	let buttonMessage = 'You wont be charget yet';
	if (!viewer?.id) {
		buttonMessage = 'You have to be signed in to book a listing!';
	} else if (viewerIsHost) {
		buttonMessage = "You can't book your own a listing!";
	} else if (!host.hasWallet) {
		buttonMessage =
			"The host has disconnected from Stripe and thus won't be able to recieve payments!";
	}

	const veryfiAndSetCheckOut = (selectedCheckOutDate: Moment | null) => {
		if (checkInDate && selectedCheckOutDate) {
			if (moment(selectedCheckOutDate).isBefore(checkInDate, 'days')) {
				return displayErrorMessage(
					`You can't book date of check out to be prior to check in!`
				);
			}

			let dateCursor = checkInDate;
			while (moment(dateCursor).isBefore(selectedCheckOutDate, 'days')) {
				dateCursor = moment(dateCursor).add(1, 'days');
				const year = moment(dateCursor).year();
				const month = moment(dateCursor).month();
				const day = moment(dateCursor).date();

				if (
					bookingsIndexJSON[year] &&
					bookingsIndexJSON[year][month] &&
					bookingsIndexJSON[year][month][day]
				) {
					return displayErrorMessage(
						"You can't book a period of time that overlaps existing booking. Please try again!"
					);
				}
			}
		}
		setCheckOutDate(selectedCheckOutDate);
	};

	return (
		<div className="listing-booking">
			<Card className="listing-booking__card">
				<div>
					<Paragraph>
						<Title level={2} className="listing-booking__card-title">
							{formatListingPrice(price)}
							<span>/day</span>
						</Title>
					</Paragraph>
					<Divider />

					<div className="listing-booking__card-date-picker">
						<Paragraph strong>Check In</Paragraph>
						<DatePicker
							value={checkInDate}
							showToday={false}
							disabled={checkInInputDisabled}
							disabledDate={disabledDate}
							onChange={setCheckInDate}
							onOpenChange={() => setCheckOutDate(null)}
							format="YYYY/MM/DD"
						/>
					</div>
					<div className="listing-booking__card-date-picker">
						<Paragraph strong>Check Out</Paragraph>
						<DatePicker
							value={checkOutDate}
							showToday={false}
							disabledDate={disabledDate}
							disabled={checkOutInputDisabled}
							onChange={veryfiAndSetCheckOut}
							format="YYYY/MM/DD"
						/>
					</div>
				</div>
				<Divider />
				<Button
					size="large"
					disabled={buttonDisabled}
					type="primary"
					onClick={() => setModalVisible(true)}
					className="listing-booking__card-cta">
					Request to book!
				</Button>
				<Text type="secondary" mark>
					{buttonMessage}
				</Text>
			</Card>
		</div>
	);
};
