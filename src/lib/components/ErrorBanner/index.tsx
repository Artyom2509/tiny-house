import { Alert } from 'antd';

interface Props {
	message?: string;
	description?: string;
}

export const ErrorBanner = ({
	message = 'Something went wrong :(',
	description = 'Look like something went wrong. Check your connection or try later.',
}: Props) => {
	return (
		<Alert
			banner
			closable
			message={message}
			description={description}
			type="error"
			className="error-banner"
		/>
	);
};
