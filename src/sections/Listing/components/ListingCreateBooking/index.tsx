import { Button, Card, DatePicker, Divider } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import Title from 'antd/lib/typography/Title';
import moment, { Moment } from 'moment';
import { displayErrorMessage, formatListingPrice } from '../../../../lib/utils';

interface Props {
	price: number;
	checkInDate: Moment | null;
	checkOutDate: Moment | null;
	setCheckOutDate: (date: Moment | null) => void;
	setCheckInDate: (date: Moment | null) => void;
}

export const ListingCreateBooking = ({
	price,
	checkInDate,
	checkOutDate,
	setCheckInDate,
	setCheckOutDate,
}: Props) => {
	const disabledDate = (currentDate?: Moment): boolean => {
		if (currentDate) return currentDate.isBefore(moment().endOf('day'));
		else return false;
	};

	const veryfiAndSetCheckOut = (selectedCheckOutDate: Moment | null) => {
		if (checkInDate && selectedCheckOutDate) {
			if (moment(selectedCheckOutDate).isBefore(checkInDate, 'days')) {
				return displayErrorMessage(
					`You can't book date of check out to be prior to check in!`
				);
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
							disabled={!checkInDate}
							onChange={veryfiAndSetCheckOut}
							format="YYYY/MM/DD"
						/>
					</div>
				</div>
				<Divider />
				<Button
					size="large"
					disabled={!checkInDate || !checkOutDate}
					type="primary"
					className="listing-booking__card-cta">
					Request to book!
				</Button>
			</Card>
		</div>
	);
};
