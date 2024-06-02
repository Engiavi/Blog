import React from 'react';
import axios from "axios";

const UploadImage = async (img) => {
    let imgUrl = null;
    try {
        const { data: uploadUrl } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url");
        await axios({
            method: "PUT",
            url: uploadUrl.uploadUrl,
            headers: {"Content-Type": 'multipart/form-data'},
            data: img
        });
        imgUrl = uploadUrl.uploadUrl.split("?")[0];
    } catch (error) {
        console.error("Error uploading image:", error);
        // Handle the error, possibly by returning a default URL or rethrowing the error
    }

    return imgUrl;
}

export default UploadImage;
