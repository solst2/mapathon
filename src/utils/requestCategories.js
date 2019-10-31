class RequestCategories  {
    static async getAllCategory(getTokenSilently, loginWithRedirect) {
        try {
            let token = await getTokenSilently();
            let response = await fetch(`${process.env.REACT_APP_SERVER_URL}/category`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            let data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            await loginWithRedirect();
        }
    }

}