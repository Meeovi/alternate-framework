import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { auth } from "../../../../utils/auth";

const oauthProviderCapableAuth = auth as typeof auth & {
	api: {
		getOAuthServerConfig: (...args: any[]) => any;
	};
};

export const GET = oauthProviderAuthServerMetadata(oauthProviderCapableAuth);