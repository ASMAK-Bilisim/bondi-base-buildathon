import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import PrimaryMarket from "../pages/PrimaryMarket";
import SingleBondPage from "../pages/SingleBondPage";
import Coupons from "../pages/Coupons";
import KYCMenu from "../pages/KYCMenu";
import { KYCProvider } from '../components/contexts/KYCContext';
import CDSMarket from "../pages/CDSMarket";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<KYCProvider>
				<Layout />
			</KYCProvider>
		),
		children: [
			{
				path: "/",
				element: <PrimaryMarket />,
			},
			{
				path: "primary-market/:bondId",
				element: <SingleBondPage />,
			},
			{
				path: "cds-market",
				element: <CDSMarket />,
			},
			{
				path: "coupons",
				element: <Coupons />,
			},
			{
				path: "kyc",
				element: <KYCMenu />,
			},
		],
	},
]);
