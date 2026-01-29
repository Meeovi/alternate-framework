export const unwrap = (response) => {
    if (response.error) {
        return {
            ok: false,
            error: response.error
        };
    }
    return {
        ok: true,
        data: response.data
    };
};
