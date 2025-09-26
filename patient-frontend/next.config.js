/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    // Exclude the Fuse Patient Portal UI folder from compilation
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /Fuse Patient Portal UI/,
    });
    return config;
  },
  // Exclude the reference folder from file tracing
  outputFileTracingExcludes: {
    '*': ['./Fuse Patient Portal UI/**/*']
  }
}

module.exports = nextConfig