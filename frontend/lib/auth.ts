
let accessTokenMemory: string | null = null;

export const getAccessToken = () => accessTokenMemory;
export const setAccessToken = (token: string) => { accessTokenMemory = token; };
export const clearAccessToken = () => { accessTokenMemory = null; };