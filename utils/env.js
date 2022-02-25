// Load values from env 
require('dotenv').config();

exports.PHOTOS_PORT = parseInt(process.env.PHOTOS_PORT || 4000),
exports.PHOTOS_PATH = process.env.PHOTOS_PATH || '~/photos';
exports.PHOTOS_PASSWORD = process.env.PHOTOS_PASSWORD; // No default
exports.PHOTOS_SMALL_IMAGES_CACHE = parseInt(process.env.PHOTOS_SMALL_IMAGES_CACHE || 20000);
exports.PHOTOS_BIG_IMAGES_CACHE = parseInt(process.env.PHOTOS_BIG_IMAGES_CACHE || 1000);
exports.PHOTOS_SMALL_IMAGES_SIZE = parseInt(process.env.PHOTOS_SMALL_IMAGES_SIZE || 200);
exports.PHOTOS_SMALL_BIG_IMAGES_SIZE = parseInt(process.env.PHOTOS_SMALL_BIG_IMAGES_SIZE || 1920);
