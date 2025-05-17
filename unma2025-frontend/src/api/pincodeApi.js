import axios from "axios";

export const getPincodeDetails = async (pincode) => {
    try {
        // Validate pincode format
        if (!/^\d{6}$/.test(pincode)) {
            throw new Error("Invalid pincode format");
        }

        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
            timeout: 5000, // 5 second timeout
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);

        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
            throw new Error("Invalid API response format");
        }

        if (response.data[0].Status !== "Success") {
            throw new Error(`API Error: ${response.data[0].Status}`);
        }

        if (!response.data[0].PostOffice || response.data[0].PostOffice.length === 0) {
            throw new Error("No post office data found");
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(`API Error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error("No response received from the server");
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`Error: ${error.message}`);
        }
    }
};
