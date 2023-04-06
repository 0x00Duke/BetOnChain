/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
};

const path = require('path');


module.exports = {
	sassOptions: {
		fiber: false,
		includePaths: [path.join(__dirname, 'styles')],
	},
	env: {
	},
};

module.exports = nextConfig;
