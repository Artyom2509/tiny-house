import React, { useState } from 'react';
import {
	Layout,
	Form,
	Input,
	Typography,
	InputNumber,
	Radio,
	Upload,
	Button,
} from 'antd';
import { Viewer } from '../../lib/types';
import { Link, Redirect } from 'react-router-dom';
import { ListingType } from '../../lib/graphql/globalTypes';
import {
	BankOutlined,
	HomeOutlined,
	LoadingOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import {
	displayErrorMessage,
	iconColor,
	displaySuccessNotification,
} from './../../lib/utils/index';
import { UploadChangeParam } from 'antd/lib/upload';
import { useMutation } from '@apollo/react-hooks';
import { HOST_LISTING } from './../../lib/graphql/mutations/HostListing/index';
import { HostListing } from '../../lib/graphql/mutations/HostListing/__generated__/HostListing';
import { HostListingVariables } from './../../lib/graphql/mutations/HostListing/__generated__/HostListing';
import { useScrollToTop } from '../../lib/hooks';

const { Content } = Layout;
const { Item } = Form;
const { Text, Title } = Typography;

interface Props {
	viewer: Viewer;
}

export const Host: React.FC<Props> = ({ viewer }) => {
	const [imageLoading, setImageLoading] = useState(false);
	const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);
	const [form] = Form.useForm();
	const [hostListing, { loading, data }] = useMutation<
		HostListing,
		HostListingVariables
	>(HOST_LISTING, {
		onCompleted: () =>
			displaySuccessNotification("You've successfully created your listing!"),
		onError: () => {
			displayErrorMessage(
				"Sorry! We weren't able to create your listing. Please try again later."
			);
		},
	});

	useScrollToTop();

	const onFinishFailed = ({ errorFields }: any) => {
		form.scrollToField(errorFields[0].name, {
			block: 'center',
			inline: 'center',
		});
		displayErrorMessage(errorFields[0].errors[0]);
	};

	const onFinish = (values: any) => {
		const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;

		const input = {
			...values,
			image: imageBase64Value,
			address: fullAddress,
			price: values.price * 100,
		};
		delete input.postalCode;
		delete input.state;
		delete input.city;

		hostListing({ variables: { input } });
	};

	const handleImageUpload = (info: UploadChangeParam) => {
		const { file } = info;

		if (file.status === 'uploading') {
			setImageLoading(true);
			return;
		}

		if (file.status === 'done' && file.originFileObj) {
			getBase64Value(file.originFileObj, (imageBase64Value) => {
				setImageBase64Value(imageBase64Value);
				setImageLoading(false);
			});
		}
	};

	// if (!viewer.id || !viewer.hasWallet) {
	if (!viewer.id) {
		return (
			<Content className="host-content">
				<div className="host__form-header">
					<Title level={3} className="host__form-title">
						You'll have to be signed in and connected with Stripe to host a
						listing!
					</Title>
					<Text type="secondary">
						We only allow users who've signed in to application and have
						connected with Stripe to host new listings. You can sign in at the{' '}
						<Link to="/login">/login</Link> page and connect with Stripe shortly
						after.
					</Text>
				</div>
			</Content>
		);
	}

	if (loading) {
		return (
			<Content className="host-content">
				<div className="host__form-header">
					<Title level={3} className="host__form-title">
						Please wait!
					</Title>
					<Text type="secondary">We're creating your listing now.</Text>
				</div>
			</Content>
		);
	}

	if (data && data.hostListing) {
		return <Redirect to={`/listing/${data.hostListing.id}`} />;
	}

	return (
		<Content className="host-content">
			<Form
				layout="vertical"
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}>
				<div className="host__form-header">
					<Title level={3} className="host__form-title">
						Hi! Lets get started listing your place.
					</Title>
					<Text type="secondary">
						In this form, we'll collect some basic and additional information
						about your listing.
					</Text>
				</div>

				<Item
					name="type"
					label="Home Type"
					rules={[{ required: true, message: 'Please select a home type!' }]}>
					<Radio.Group>
						<Radio.Button value={ListingType.APARTMENT}>
							<BankOutlined style={{ color: iconColor }} />{' '}
							<span>Apartment</span>
						</Radio.Button>

						<Radio.Button value={ListingType.HOUSE}>
							<HomeOutlined style={{ color: iconColor }} /> <span>House</span>
						</Radio.Button>
					</Radio.Group>
				</Item>

				<Item
					label="Max # of Guests"
					name="numOfGuests"
					rules={[
						{ required: true, message: 'Please enter a max number of guests!' },
					]}>
					<InputNumber min={1} placeholder="4"></InputNumber>
				</Item>

				<Item
					label="Title"
					extra="Max character count of 45"
					name="title"
					rules={[
						{
							required: true,
							message: 'Please enter a title of your listing!',
						},
					]}>
					<Input
						maxLength={45}
						placeholder="The iconic and luxorious Bel-Air mansion"
					/>
				</Item>

				<Item
					label="Description"
					extra="Max character count of 400"
					name="description"
					rules={[
						{
							required: true,
							message: 'Please enter a description of your listing!',
						},
					]}>
					<Input.TextArea
						rows={3}
						maxLength={400}
						placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
					/>
				</Item>

				<Item
					label="Address"
					name="address"
					rules={[
						{
							required: true,
							message: 'Please enter a address of your listing!',
						},
					]}>
					<Input placeholder="251 North Bristol Avenue" />
				</Item>

				<Item
					label="City/Town"
					name="city"
					rules={[
						{
							required: true,
							message: 'Please enter a city (or region) of your listing!',
						},
					]}>
					<Input placeholder="Los Angeles" />
				</Item>

				<Item
					label="State/Province"
					name="state"
					rules={[
						{
							required: true,
							message: 'Please enter a state (or province) of your listing!',
						},
					]}>
					<Input placeholder="California" />
				</Item>

				<Item
					label="Zip/Postal Code"
					name="postalCode"
					rules={[
						{
							required: true,
							message: 'Please enter a zip code of your listing!',
						},
					]}>
					<Input placeholder="Please enter a zip code for your listing!" />
				</Item>

				<Item
					label="Image"
					extra="Images have to be under 1MB in size and of type JPG or PNG"
					name="image"
					rules={[
						{
							required: true,
							message: 'Please enter provide an image of your listing!',
						},
					]}>
					<div className="host__form-image-upload">
						<Upload
							name="image"
							listType="picture-card"
							showUploadList={false}
							action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
							beforeUpload={beforeImageUpload}
							onChange={handleImageUpload}>
							{imageBase64Value ? (
								<img src={imageBase64Value} alt="listing" />
							) : (
								<div>
									{imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
									<div className="ant-upload-text">Upload</div>
								</div>
							)}
						</Upload>
					</div>
				</Item>

				<Item
					label="Price"
					extra="All prices in $USD/day"
					name="price"
					rules={[
						{
							required: true,
							message: 'Please enter a price of your listing!',
						},
					]}>
					<InputNumber min={0} placeholder="120" />
				</Item>

				<Item>
					<Button htmlType="submit" type="primary">
						Submit
					</Button>
				</Item>
			</Form>
		</Content>
	);
};

const beforeImageUpload = (file: File) => {
	const fileIsValidImage =
		file.type === 'image/jpeg' || file.type === 'image/png';
	const fileIsValidSize = file.size / 1024 / 1024 < 1;

	if (!fileIsValidImage) {
		displayErrorMessage('Your only able to upload valid JPEG or PNG files!');
		return false;
	}
	if (!fileIsValidSize) {
		displayErrorMessage('Your only able to upload image 1MB size!');
		return false;
	}

	return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (
	img: File | Blob,
	callback: (imageBase64Value: string) => void
) => {
	const reader = new FileReader();
	reader.readAsDataURL(img);
	reader.onload = () => callback(reader.result as string);
};
