"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiGrid, FiPackage } from "react-icons/fi";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-44 pb-24 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute  rounded-b-[30px] inset-0 z-0">
        <div
          className="absolute rounded-b-[30px] inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/hero-bg.jpg)",
          }}
        />
        {/* Orange-tinted dark overlay */}
        <div className="absolute rounded-b-[30px] inset-0 bg-gradient-to-br from-[#003049]/75 via-[#003049]/70 to-[#F97316]/40" />
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Scale your{" "}
            <span className="text-[#F97316] bg-gradient-to-r from-[#F97316] to-[#facc15] bg-clip-text text-transparent">
              ideas
            </span>{" "}
            faster than ever
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            Discover amazing products, connect with buyers and sellers in your
            area, and get the best deals on everything you need.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={<FiGrid className="w-5 h-5" />}
              onClick={() => {
                document
                  .getElementById("categories")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Browse Categories
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={<FiPackage className="w-5 h-5" />}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-[#003049]"
              onClick={() => {
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Products
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
