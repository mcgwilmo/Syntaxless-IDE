import type { NextConfig } from "next";

/*
 * The only entry here used to be a remotePatterns allowance for randomuser.me,
 * which existed solely to let next/image load stock portraits for testimonials
 * that were never real. The testimonials are gone, so the allowance is too --
 * leaving it would quietly re-permit hot-linking strangers' photos the next
 * time someone reaches for a placeholder face.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
