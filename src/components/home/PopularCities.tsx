"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/src/utils/constants";
import { cn } from "@/src/utils/cn";

interface PopularCitiesProps {
  cities: { CityId: number; CityName: string }[];
  onCityClick?: (cityId: number) => void;
  className?: string;
}

export const PopularCities: React.FC<PopularCitiesProps> = ({
  cities,
  onCityClick,
  className,
}) => {
  if (!cities || cities.length === 0) return null;

  return (
    <section className={cn("py-8", className)}>
      <div className="">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#003049] to-[#F97316] bg-clip-text text-transparent">
              Popular Cities
            </h2>
            <p className="text-gray-600">
              Browse products in these popular locations
            </p>
          </div>
          <Link
            // href={`${ROUTES.CATEGORY}/${category?.id || ''}`}
            href={"#"}
            className="text-[#F97316] font-semibold hover:text-[#d97706] transition-colors flex items-center gap-2 group"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cities.slice(0, 4).map((city, index) => (
            <motion.div
              key={city.CityId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link
                // href={`${ROUTES.CITY}/${city.CityId}`}
                href={`/city/${city.CityId}`}
                // onClick={(e) => {
                //   e.preventDefault();
                //   onCityClick?.(city.CityId);
                // }}
                className="block"
              >
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-[#F97316]/50 group-hover:scale-105">
                  {/* <div className="w-12 h-12 bg-gradient-to-br from-[#F97316]/10 to-[#003049]/10 rounded-full flex items-center justify-center mb-4 group-hover:from-[#F97316]/20 group-hover:to-[#003049]/20">
                    <span className="text-2xl">📍</span>
                  </div> */}
                  <h3 className="font-semibold text-gray-900 text-lg text-center group-hover:text-[#F97316] transition-colors">
                    {city.CityName}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
