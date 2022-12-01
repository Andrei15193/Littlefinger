export interface IHomeRouteParams {
}

export type IAuthenticationFormBody = ISuccessfulAuthenticationFormBody | IFaultedAuthenticationFormBody;

export interface ISuccessfulAuthenticationFormBody {
    readonly client_info: string;
    readonly code: string;
    readonly state: string;
}

export interface IFaultedAuthenticationFormBody {
    readonly error: string;
    readonly error_description: string;
    readonly state: string;
}

export class AuthenticationFormBodyHelper {
    public static isSuccessful(body: any): body is ISuccessfulAuthenticationFormBody {
        return body.code !== undefined && body.code !== null
            && body.state !== undefined && body.state !== null;
    }

    public static isFaulted(body: any): body is IFaultedAuthenticationFormBody {
        return body.error !== undefined && body.error !== null
            && body.error_description !== undefined && body.error_description !== null
            && body.state !== undefined && body.state !== null;
    }
}