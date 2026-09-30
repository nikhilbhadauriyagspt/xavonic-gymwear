const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const db = require('../config/db');

// Configure Cloudinary dynamically from DB settings or fallback
async function getCloudinaryClient() {
  const [settings] = await db.query(
    "SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN ('cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret')"
  );

  const configMap = {};
  settings.forEach((s) => {
    configMap[s.setting_key] = s.setting_value;
  });

  cloudinary.config({
    cloud_name: configMap.cloudinary_cloud_name || 'fwlidd7t',
    api_key: configMap.cloudinary_api_key || '887531852538712',
    api_secret: configMap.cloudinary_api_secret || 'lkB-KXtVa7j9Zi8pzhTn1VhT5xU',
    secure: true,
  });

  return cloudinary;
}

// Upload buffer directly to Cloudinary
exports.uploadToCloudinary = async (buffer, folder = 'guidelya/categories') => {
  const client = await getCloudinaryClient();

  return new Promise((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

exports.getCloudinaryClient = getCloudinaryClient;
