import React from "react";
import { IMAGE_BASE } from "@/constants/constants";

const ReliefFund = () => {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white max-w-3xl mx-auto shadow-2xl">

            {/* Decorative Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-r from-orange-500 via-white to-green-600" />

                <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-40" />
                <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-40" />
            </div>

            <div className="relative p-6 md:p-10">


                {/* Title */}
                <div className="text-center mt-4">

                    {/* <p className="text-orange-600 font-bold uppercase tracking-wider">
        Government Initiative
      </p> */}

                    <h1 className="text-3xl md:text-5xl font-extrabold mt-2 text-gray-900">
                        International Day of Yoga
                    </h1>

                    <h2 className="text-2xl md:text-4xl font-bold text-blue-900 mt-2">
                        21st June 2026
                    </h2>
                </div>

                {/* Yoga Graphic */}
                <div className="flex justify-center my-6">
                    <img
                        src={`${IMAGE_BASE}Yoga-logo.jpeg`}
                        alt="Yoga"
                        className="h-44 md:h-60"
                    />
                </div>

                {/* Description */}
                <div className="text-center max-w-2xl mx-auto">

                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                        Register yourself on the
                        <span className="font-bold text-blue-800">
                            {" "}Yoga Sangam Portal
                        </span>
                        {" "}and become a part of India's nationwide Yoga movement.
                    </p>

                    <p className="mt-3 text-gray-600">
                        Join millions of participants celebrating health,
                        wellness and harmony through Yoga.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex justify-center mt-8">

                    <a
                        href="https://yoga.ayush.gov.in/yoga-sangam"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                    >
                        <div className="
          bg-linear-to-r
          from-orange-500
          via-orange-600
          to-green-600
          text-white
          px-8
          py-4
          rounded-2xl
          font-bold
          text-lg
          shadow-xl
          hover:scale-105
          transition-all
          duration-300
        ">
                            Register Now
                        </div>
                    </a>

                </div>

                {/* Footer */}
                <div className="text-center mt-6">

                    <p className="text-sm text-gray-500">
                        Ministry of Ayush • Government of India
                    </p>

                </div>

            </div>

        </div>
    );
};

export default ReliefFund;