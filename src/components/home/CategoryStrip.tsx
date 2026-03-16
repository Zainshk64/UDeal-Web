"use client";

import React from "react";
import { motion } from "framer-motion";
import { CategoryChip } from "./CategoryChip";
import { CATEGORIES } from "@/src/utils/constants";
import { Container } from "../ui/Container";
import { useRouter } from "next/navigation";

export const CategoryStrip: React.FC = () => {
    const router = useRouter();

  return (
    <div className="relative -mt-13 z-20" id="categories">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/50 rounded-2xl shadow-lg backdrop-blur-3xl p-4 border border-gray-100"
        >
          {/* Scrollable Container */}
          <div className="flex overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 lg:grid-cols-10 md:overflow-visible">
            {CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryChip
                  name={category.name}
                  icon={category.icon}
                  image={category.image}
                  onClick={() => {
        router.push(`/category/${category.id}`);
      }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
  );
};
