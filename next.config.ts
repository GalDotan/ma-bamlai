import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true
})

const nextConfig = {
  // if you're using output: 'export' for static export, add it here
  reactStrictMode: true,
  // output: 'export', // optional
}

module.exports = withPWA(nextConfig)