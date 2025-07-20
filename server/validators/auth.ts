import type {H3Event} from "h3";
import {jwtDecode} from "jwt-decode";
import type {JwtPayload} from "jwt-decode";

const validateAuth = (event: H3Event) => {
    const authToken = getRequestHeader(event, 'Authorization');
    console.log(authToken)
    try {
        const token = authToken?.split(' ')[1]
        const decodedToken = jwtDecode<JwtPayload>(token ?? '');
        console.log('Decoded Payload:', decodedToken);

        // Access claims
        console.log('Subject aka userId:', decodedToken.sub);
        console.log('Issued At:', new Date((decodedToken.iat ?? 0) * 1000));

        return decodedToken
    } catch (error) {
        console.error('Error decoding JWT:', error);
        const response = {
            statusCode: 401,
            statusMessage: 'Authorization error'
        }
        throw createError(response)
    }
}

export default validateAuth