import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import Home from "../pages/Home";
import PrimaryMarket from "../pages/PrimaryMarket";
import Portfolio from "../pages/Portfolio";
import Coupons from "../pages/Coupons";
import Achievements from "../pages/Achievements";
import KYCMenu from "../pages/KYCMenu";
import { KYCProvider } from '../components/contexts/KYCContext';

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
				element: <Home />,
			},
			{
				path: "primary-market",
				element: <PrimaryMarket />,
			},
			{
				path: "portfolio",
				element: <Portfolio />,
			},
			{
				path: "coupons",
				element: <Coupons />,
			},
			{
				path: "achievements",
				element: <Achievements />,
			},
			{
				path: "kyc", // Add this new route
				element: <KYCMenu />,
			},
			// Settings route can be added here when implemented
		],
	},
]);