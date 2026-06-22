require('dotenv').config();
const cloudinary = require('cloudinary').v2;

//Make the cloudinary configuration from .env file
cloudinary.config({
    'cloud_name': process.env.CLOUDINARY_CLOUD_NAME,
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_API_SECRET
});

async function cloudinaryTest() {

    // Upload
    const res = cloudinary.uploader.upload('https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg', { public_id: "olympic_flag-1" })

    res.then((data) => {
        console.log(data);
        console.log(data.secure_url);
    }).catch((err) => {
        console.log(err);
    });


    // Generate 
    const url = cloudinary.url("olympic_flag", {
        width: 100,
        height: 150,
        Crop: 'fill'
    });



    return url;
}


//Cloudinary Upload Function. Process multiple images and videos at once. Return the public ids of the uploaded files.
async function cloudinaryUpload(files) {

    return files;

    //Upload the files
    const res = cloudinary.uploader.upload(files.path, { public_id: "olympic_flag-1" })

    res.then((data) => {
        console.log(data);
        console.log(data.secure_url);
    }).catch((err) => {
        console.log(err);
    });

    return res;
}


//Export the function
module.exports = {
    cloudinaryTest: cloudinaryTest,
    cloudinaryUpload: cloudinaryUpload
}